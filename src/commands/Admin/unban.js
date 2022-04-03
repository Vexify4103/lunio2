// Dependencies
const {
     Embed
} = require('../../utils'),
     Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
const {
     userSchema
} = require("../../database/models");
module.exports = class Unban extends Command {
     constructor(bot) {
          super(bot, {
               name: 'unban',
               adminOnly: true,
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Lets you unban users from controlling the bot.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'unban <user>',
               slash: true,
               options: [{
                    name: 'user',
                    description: 'Select user to be unbanned.',
                    type: 6,
                    required: true,
               }],
          });
     }

     async callback(bot, interaction, guild, args, settings) {
          const member = interaction.options.getMember('user');
          // member.user = CustomUser data
          // interaction.user = CustomUser data from author
          let embed;

          if (member.user.id === interaction.user.id) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/unban:EMBED_SELF_UNBAN'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }
          // check if member mentioned is a bot
          if (member.user.bot) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/unban:EMBED_USER_BOT'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }

          const res = await bot.getUserData(bot, member.user.id);
          if (res.guilds.includes(interaction.guildId)) {
               let newGuilds = res.guilds;
               const indexOfObject = newGuilds.findIndex(id => {
                    return id === interaction.guildId
               })
               newGuilds.splice(indexOfObject, 1);

               let newsettings = {
                    userID: member.user.id,
                    userNAME: member.user.username + "#" + member.user.discriminator,
                    guilds: newGuilds
               }

               await bot.updateUserSettings(member.user, newsettings);

               embed = new MessageEmbed()
                    .setColor(bot.config.colorTrue)
                    .setDescription(bot.translate(settings.Language, 'Admin/unban:EMBED_SUCCESSFULL_UNBAN', {
                         USER: member.user.username + "#" + member.user.discriminator
                    }))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          } else {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'Admin/unban:EMBED_ALREADY_UNBANNED', {
                         USER: member.user.username + "#" + member.user.discriminator
                    }))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }
     }
};