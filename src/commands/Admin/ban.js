// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder,
     PermissionsBitField
} = require("discord.js");
module.exports = class Ban extends Command {
     constructor(bot) {
          super(bot, {
               name: 'ban',
               adminOnly: true,
               dirname: __dirname,
               description: 'Lets you ban users from controlling the bot.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'ban <user>',
               slash: true,
               options: [{
                    name: 'user',
                    description: 'Select user to be banned.',
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
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/ban:EMBED_SELF_BAN'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }
          // check if member mentioned is a bot
          if (member.user.bot) {
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/ban:EMBED_USER_BOT'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }
          if (member.permissions.has(PermissionsBitField.Flags.Administrator) || member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/ban:EMBED_USER_PERMS', {
                         PERMISSIONS: `${bot.codeBlock('Manage Server, Administrator')}`
                    }))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
          const res = await bot.getUserData(bot, member.user.id);
          if (!res.guilds.includes(interaction.guildId)) {
               let newGuilds = res.guilds;
               newGuilds.push(interaction.guildId);
               let newsettings = {
                    userID: member.user.id,
                    userNAME: member.user.username + "#" + member.user.discriminator,
                    guilds: newGuilds
               }
               await bot.updateUserSettings(member.user, newsettings);

               embed = new EmbedBuilder()
                    .setColor(bot.config.colorTrue)
                    .setDescription(bot.translate(settings.Language, 'Admin/ban:EMBED_SUCCESSFULL_BAN', {
                         USER: `${bot.codeBlock(member.user.username + '#' + member.user.discriminator)}`
                    }))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          } else {
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'Admin/ban:EMBED_ALREADY_BANNED', {
                         USER: `${bot.codeBlock(member.user.username + '#' + member.user.discriminator)}`
                    }))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               });
          }
     }
};