// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Pause extends Command {
     constructor(bot) {
          super(bot, {
               name: 'pause',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Pauses the current playing song.',
               slash: true,
               usage: 'pause',
               music: true,
               reqplayer: true,
               reqvc: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;


          if (player.paused) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'DJ/pause:EMBED_ALREADY_PAUSED'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          player.pause(true);

          embed =  new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setDescription(bot.translate(settings.Language, 'DJ/pause:EMBED_PAUSED_SONG'))

               
          interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
          if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
          return;
          }
};