// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Shuffle extends Command {
     constructor(bot) {
          super(bot, {
               name: 'shuffle',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Shuffle the queue.',
               slash: true,
               usage: 'shuffle',
               music: true,
               reqplayer: true,
               reqvc: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;

          if (player.queue.size <= 2) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'DJ/shuffle:EMBED_NEED_3'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          player.queue.shuffle();

          embed = new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setDescription(bot.translate(settings.Language, 'DJ/shuffle:EMBED_SHUFFLED_QUEUE'))

               
          interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
          if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
          return;
     }
};