// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Skip extends Command {
     constructor(bot) {
          super(bot, {
               name: 'skip',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Lets you skip the current song.',
               slash: true,
               usage: 'skip',
               music: true,
               reqplayer: true,
               reqvc: true,
               options: [{
				name: 'amount',
				description: 'Skips to a specific track in the queue.',
				type: 4,
				required: false,
			}],
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let amount = interaction.options.getInteger('amount');
          let embed;

          if (!amount || amount >= 1) {
               player.stop()
               embed = new MessageEmbed()    
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/skip:EMBED_SKIPPED_1'))

                    
               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
          } else if (amount) {
               if (amount > player.queue.size) amount = player.queue.size;
               player.stop(amount)

               embed = new MessageEmbed()    
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/skip:EMBED_SKIPPED_X', {
                         amount: amount
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