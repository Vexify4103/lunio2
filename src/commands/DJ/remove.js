// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Remove extends Command {
     constructor(bot) {
          super(bot, {
               name: 'remove',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Removes a song from the queue.',
               slash: true,
               usage: 'remove <from> <to>',
               music: true,
               reqplayer: true,
               reqvc: true,
               options: [{
				name: 'from',
				description: 'Song position in the queue.',
				type: 4,
				required: true,
			},
			{
				name: 'to',
				description: 'Second song position in the queue. (range removal)',
				type: 4,
				required: false,
			}],
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let pos1 = interaction.options.getInteger('from');
          let pos2 = interaction.options.getInteger('to');
          let embed;

          if (player.queue.size <= 0) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'DJ/remove:EMBED_NO_QUEUE'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          if (pos1 === 0) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'DJ/remove:EMBED_NO_SONG'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          if (pos1 > player.queue.size) pos1 = player.queue.size;
          if (!pos2) {
               player.queue.splice(pos1 - 1, 1);

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/remove:EMBED_REMOVED_SONG'))

          
               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
          } else if (pos2) {
               if (pos2 === 0) pos2 = 1;
               if (pos2 > player.queue.size) pos2 = player.queue.size -1;
               if (pos1 > pos2) {
                    pos1 = pos1 + pos2;
                    pos2 = pos1 - pos2;
                    pos1 = pos1 - pos2; 
               }

               const before = player.queue.size
               const songsToRemove = pos2 - pos1;
			player.queue.splice(pos1 - 1, songsToRemove + 1);
               const after = player.queue.size
               const removedSongs = before - after

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/remove:EMBED_REMOVED_RANGE', {
                         removedSongs: removedSongs
                    }))

               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
               }
     }
};