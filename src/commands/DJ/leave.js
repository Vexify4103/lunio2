// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder
} = require("discord.js");

module.exports = class Leave extends Command {
     constructor(bot) {
          super(bot, {
               name: 'leave',
               helpPerms: "DJ",
               dirname: __dirname,
               description: 'Disconnects the bot from its current voice channel.',
               slash: true,
               usage: 'leave',
               music: true,
               reqplayer: false,
               reqvc: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;

          if (guild.members.me.voice.channel) {
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorTrue)
                    .setDescription(bot.translate(settings.Language, 'DJ/leave:EMBED_LEFT_VC'))
               if (player) {
                    player.destroy();
                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               }
               guild.members.me.voice.disconnect().catch(() => {});
               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
          embed = new EmbedBuilder()
               .setColor(bot.config.colorWrong)
               .setDescription(bot.translate(settings.Language, 'DJ/leave:EMBED_NO_VC'))

          return interaction.reply({
               embeds: [embed],
               ephemeral: true
          })

     }
};