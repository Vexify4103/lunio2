// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
module.exports = class Setdj extends Command {
     constructor(bot) {
          super(bot, {
               name: 'setdj',
               adminOnly: true,
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'Show the current DJ roles.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'setdj show',
               slash: true,
               options: [{
                    name: "show",
                    description: "Show current set limits.",
                    type: 1,
               }, {
                    name: "role",
                    description: "Add/Remove a DJ role.",
                    type: 1,
                    options: [{
                         name: "role",
                         description: "Add/Remove a DJ role.",
                         type: 8,
                         required: true
                    }]
               }, {
                    name: "reset",
                    description: "Reset the DJ roles.",
                    type: 1
               }],
               methods: [{
                    name: "<role>",
                    description: "Add/Remove a DJ role.",
                    perms: "Admin"
               }, {
                    name: "reset",
                    description: "Reset the DJ roles.",
                    perms: "Admin"
               }]
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const Sub = interaction.options.getSubcommand(["show", "role", "reset"]);
          let role = interaction.options.getRole('role');
          // console.log(role) <@&role.id>
          let embed;
          let newSettings;

          switch (Sub) {
               case "show":
                    if (!settings.MusicDJ) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Admin/setdj:EMBED_NO_DJ'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    let str = [];
                    for (let i = 0; i < settings.MusicDJRole.length; i++) {
                         str.push(`<@&${settings.MusicDJRole[i]}>`)
                    }
                    let title = bot.translate(settings.Language, 'Admin/setdj:EMBED_DJ_TITLE')
                    embed = new MessageEmbed()
                         .setColor(bot.config.colorOrange)
                         .setTitle(title)
                         .setDescription(`${str.join('\n')}`)

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "role":
                    let array = settings.MusicDJRole

                    if (array.includes(role.id)) {
                         const indexOfObject = array.findIndex(id => {
                              return id === role.id
                         })
                         array.splice(indexOfObject, 1)

                         if (array.length === 0) {
                              newSettings = {
                                   MusicDJ: false,
                                   MusicDJRole: array
                              }
                         } else {
                              newSettings = {
                                   MusicDJRole: array
                              } 
                         }
                         await bot.updateGuildSettings(guild.id, newSettings);

                         embed = new MessageEmbed()
                              .setColor(await bot.getColor(bot, guild.id))
                              .setDescription(bot.translate(settings.Language, 'Admin/setdj:EMBED_REMOVED_ROLE', {
                                   ROLENAME: role.name
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    array.push(role.id);

                    newSettings = {
                         MusicDJ: true,
                         MusicDJRole: array
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(bot.translate(settings.Language, 'Admin/setdj:EMBED_ADDED_ROLE', {
                              ROLENAME: role.name
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "reset":
                    if (!settings.MusicDJ) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Admin/setdj:EMBED_NO_DJ'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    newSettings = {
                         MusicDJ: false,
                         MusicDJRole: []
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(bot.translate(settings.Language, 'Admin/setdj:EMBED_RESET_ROLES'))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               default:
                    break;
          }

     }
};