// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
module.exports = class Fix extends Command {
     constructor(bot) {
          super(bot, {
               name: 'fix',
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'Tries to fix the server region.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'fix',
               slash: true,
               reqvc: true,
               reqplayer: true,
               music: true
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const member = await guild.members.fetch(interaction.user.id);
          let embed;

          const { channel } = member.voice
          try {
               channel.setRTCRegion(null);
               await bot.delay(bot, 100);
               channel.setRTCRegion('us-east');
               await bot.delay(bot, 100);
               channel.setRTCRegion(null);

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'Admin/fix:EMBED_SUCCESS'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          } catch (error) {
               bot.logger.error(`Error changing RTCRegion: ${error}`)

               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Admin/fix:EMBED_ERROR'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
     }
};