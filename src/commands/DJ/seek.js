// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Seek extends Command {
     constructor(bot) {
          super(bot, {
               name: 'seek',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Seeks to a specific position in the current song.',
               slash: true,
               usage: 'seek mm:ss',
               music: true,
               reqplayer: true,
               reqvc: true,
               options: [{
				name: 'seconds',
				description: 'The time you want to seek to.',
				type: 4,
				required: true,
			}, {
                    name: 'minutes',
				description: 'The time you want to seek to.',
				type: 4,
				required: false,
               }]
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;
          let seconds = interaction.options.getInteger('seconds');
          let minutes = interaction.options.getInteger('minutes');

          let time;
          if (!minutes || minutes === 0) {
               if (seconds >= 60) seconds = 59
               time = `${seconds.toString()}`;
          } else if (minutes) {
               time = `${minutes.toString()}:${seconds.toString()}`
          }

          const timeToSeek = bot.read24hFormat(time)

          if (timeToSeek >= player.queue.current.duration) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'DJ/seek:EMBED_SEEK_NOT_POSSIBLE'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          player.seek(timeToSeek)

          embed = new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setDescription(bot.translate(settings.Language, 'DJ/seek:EMBED_SEEKED_SONG', {
                    timeToSeek: bot.getduration(timeToSeek)
               }))
          
          return interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
     }
};