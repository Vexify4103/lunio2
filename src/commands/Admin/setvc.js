// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
module.exports = class Setvc extends Command {
     constructor(bot) {
          super(bot, {
               name: 'setvc',
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'List all restricted voice channels.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'setvc show',
               slash: true,
               options: [{
                    name: "show",
                    description: "List all restricted voice channels.",
                    type: 1,
               }, {
                    name: "voice-channel",
                    description: "Add/Remove a DJ role.",
                    type: 1,
                    options: [{
                         name: "channel",
                         description: "Add/Remove a restricted voice channel role.",
                         type: 7,
                         required: true
                    }]
               }, {
                    name: "current",
                    description: "Add your current voice channel to the restricted voice channels.",
                    type: 1
               }, {
                    name: "reset",
                    description: "Reset the DJ roles.",
                    type: 1
               }],
               methods: [{
                    name: "voice-channel",
                    description: "Add/Remove a DJ role.",
                    perms: "Admin"
               }, {
                    name: "current",
                    description: "Add your current voice channel to the restricted voice channels.",
                    perms: "Admin"
               }, {
                    name: "reset",
                    description: "Reset the DJ roles.",
                    perms: "Admin"
               }]
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const Sub = interaction.options.getSubcommand(["show", "voice-channel", "current", "reset"]);
          const member = await guild.members.fetch(interaction.user.id);
          let voiceChannel = interaction.options.getChannel('channel');
          // console.log(voiceChannel) <#vc.id>
          let embed;
          let newSettings;

          switch (Sub) {
               case "show":
                    if (!settings.VCToggle) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_NO_VC'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    let str = [];
                    for (let i = 0; i < settings.VCs.length; i++) {
                         str.push(`<#${settings.VCs[i]}>`)
                    }
                    let title = bot.translate(settings.Language, 'Admin/setvc:EMBED_VC_TITLE')
                    embed = new MessageEmbed()
                         .setColor(bot.config.colorOrange)
                         .setTitle(title)
                         .setDescription(`${str.join('\n')}`)

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "voice-channel":
                    // if (voiceChannel.type !== 'GUILD_VOICE' && voiceChannel.type !== 'GUILD_STAGE_VOICE')
                    if (voiceChannel.type !== 'GUILD_VOICE' && voiceChannel.type !== 'GUILD_STAGE_VOICE') {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_VC_NOT_FOUND'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    let array = settings.VCs

                    if (array.includes(voiceChannel.id)) {
                         const indexOfObject = array.findIndex(id => {
                              return id === voiceChannel.id
                         })
                         array.splice(indexOfObject, 1)

                         if (array.length === 0) {
                              newSettings = {
                                   VCToggle: false,
                                   VCs: array
                              }
                         } else {
                              newSettings = {
                                   VCs: array
                              }
                         }
                         await bot.updateGuildSettings(guild.id, newSettings);

                         embed = new MessageEmbed()
                              .setColor(await bot.getColor(bot, guild.id))
                              .setDescription(bot.translate(settings.Language, 'Admin/setcv:EMBED_REMOVED_VC', {
                                   VCID: voiceChannel.id
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    array.push(voiceChannel.id);

                    newSettings = {
                         VCToggle: true,
                         VCs: array
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_ADDED_VC', {
                              VCID: voiceChannel.id
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "current":
                    const { channel } = member.voice
                    if (!channel) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_VC_NOT_FOUND'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    if (settings.VCs.includes(channel.id)) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_VC_EXISTS', {
                                   VCID: channel.id
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    let array2 = settings.VCs

                    array2.push(channel.id);

                    newSettings = {
                         VCToggle: true,
                         VCs: array2
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_ADDED_VC', {
                              VCID: channel.id
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "reset":
                    if (!settings.VCToggle) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_NO_VC'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    newSettings = {
                         VCToggle: false,
                         VCs: []
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(bot.translate(settings.Language, 'Admin/setvc:EMBED_RESET_VCS'))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               default:
                    break;
          }

     }
};