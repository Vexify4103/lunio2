// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Loop extends Command {
     constructor(bot) {
          super(bot, {
               name: 'loop',
               helpPerms: "DJ",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Cycles through all three loop modes (queue, song, off).',
               slash: true,
               usage: 'loop',
               music: true,
               reqplayer: true,
               reqvc: true,
               options: [{
                    name: 'loop-modes',
                    description: 'Select a loop mode',
                    type: 3,
                    required: true,
                    choices: [{
                              name: 'off',
                              value: 'off',
                         },{
                              name: 'queue',
                              value: 'queue'
                         },
                         {
                              name: 'song',
                              value: 'song',
                         },
                    ],
               }],
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let choice = interaction.options.getString('loop-modes')
          let embed;

          if (choice === 'off') {
               if (player.trackRepeat || player.queueRepeat) {
                    player.setTrackRepeat(false);
                    player.setQueueRepeat(false);
               }

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/loop:EMBED_LOOPING_DISABLED'))

               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
          }
          if (choice === 'queue') {
               if (player.queue.size <= 0) {
                    embed = new MessageEmbed()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'DJ/loop:EMBED_NO_QUEUE'))
     
                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               }
               player.setQueueRepeat(true)

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/loop:EMBED_LOOPING_QUEUE'))

               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
          }
          if (choice === 'song') {
               player.setTrackRepeat(true)

               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'DJ/loop:EMBED_LOOPING_SONG'))
               
               interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
               if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
               return;
          }
     }
};