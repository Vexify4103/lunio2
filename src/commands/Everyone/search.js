// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder,
     ButtonBuilder,
     ActionRowBuilder,
     ButtonStyle
} = require("discord.js");

module.exports = class Search extends Command {
     constructor(bot) {
          super(bot, {
               name: 'search',
               helpPerms: "Everyone",
               dirname: __dirname,
               description: 'Searches and lets you choose a song.',
               slash: true,
               usage: 'search <song name>',
               music: true,
               reqvc: true,
               options: [{
                    name: 'song-name',
                    description: 'song name',
                    type: 3,
                    required: true,
                    autocomplete: true
               }],
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const song = interaction.options.getString('song-name');
          const member = guild.members.cache.get(interaction.user.id);
          const textchannel = guild.channels.cache.get(interaction.channelId);
          const {
               channel
          } = member.voice;
          let player;


          let res;
          // SEARCH AND CREATE PLAYER IF NONE EXISTING
          let title = bot.translate(settings.Language, 'Everyone/search:EMBED_SEARCHING_TITLE')
          const embed1 = new EmbedBuilder()
               .setColor(await bot.getColor(bot, guild.id))
               .setTitle(title)
               .setDescription(bot.translate(settings.Language, 'Everyone/search:EMBED_SEARCHING_DESC'))

          const context = await interaction.reply({
               embeds: [embed1],
               ephemeral: true,
               fetchReply: true
          })
          try {
               player = bot.manager.create({
                    guild: guild.id,
                    textChannel: textchannel.id,
                    voiceChannel: channel.id,
                    selfDeafen: true,
                    volume: settings.DefaultVol
               });
               if (player.state !== 'CONNECTED') player.connect();
          } catch (error) {
               bot.logger.error(`Error creating player search command: ${error}`);
          }

          try {
               res = await player.search(song, member.user);
               if (res.loadType === 'NO_MATCHES') {
                    if (!player.queue.current) player.destroy();

                    const embed2 = new EmbedBuilder()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'Everyone/search:EMBED_NO_SONGS_FOUND'))

                    return interaction.editReply({
                         embeds: [embed2],
                         ephemeral: true
                    })
               }
               if (res.loadType === 'LOAD_FAILED') {
                    if (!player.queue.current) player.destroy();

                    const embed6 = new EmbedBuilder()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'Everyone/search:EMBED_NO_SONGS_FOUND'))

                    return interaction.editReply({
                         embeds: [embed6],
                         ephemeral: true
                    })
               }
          } catch (error) {
               bot.logger.error(error)
               if (!player.queue.current) player.destroy();

               const embed3 = new EmbedBuilder()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Everyone/search:EMBED_NO_SONGS_FOUND'))

               interaction.reply({
                    embeds: [embed3],
                    ephemeral: true
               })
               return
          }

          let max = 5;
          let collected;


          if (res.tracks.length < max) max = res.tracks.length;
          const results = res.tracks.slice(0, max).map((track, index) => `${index + 1}. ${track.author || "Author Unknown"} - ${track.title}`).join('\n');

          const embed4 = new EmbedBuilder()
               .setColor(await bot.getColor(bot, guild.id))
               .setDescription(`${results}`)

          let row = new ActionRowBuilder()
               .addComponents(
                    new ButtonBuilder().setStyle("SECONDARY").setCustomId("1").setEmoji("1️⃣"),
                    new ButtonBuilder().setStyle("SECONDARY").setCustomId("2").setEmoji("2️⃣"),
                    new ButtonBuilder().setStyle("SECONDARY").setCustomId("3").setEmoji("3️⃣"),
                    new ButtonBuilder().setStyle("SECONDARY").setCustomId("4").setEmoji("4️⃣"),
                    new ButtonBuilder().setStyle("SECONDARY").setCustomId("5").setEmoji("5️⃣"),
               )
          interaction.editReply({
               components: [row],
               embeds: [embed4],
               ephemeral: true,
               fetch: true
          })

          const collector = context.createMessageComponentCollector({
               componentType: 'BUTTON',
               time: 30000
          });


          let track;
          var pressed = false;
          collector.on('collect', async button => {
               switch (button.customId) {
                    case "1":
                         track = res.tracks[0];
                         player.queue.add(track);
                         let a;
                         if (!player.playing && !player.paused && !player.queue.size) {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE')
                              a = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              player.play();
                              interaction.editReply({
                                   embeds: [a],
                                   ephemeral: true,
                                   components: []
                              });
                         } else {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE_2', {
                                   SIZE: player.queue.length
                              })
                              a = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              interaction.editReply({
                                   embeds: [a],
                                   components: [],
                                   ephemeral: true
                              })
                         }
                         pressed = true;
                         collector.stop();
                         button.deferUpdate();
                         return;
                    case "2":
                         track = res.tracks[1];
                         player.queue.add(track);
                         let b;
                         if (!player.playing && !player.paused && !player.queue.size) {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE')
                              b = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              player.play();
                              interaction.editReply({
                                   embeds: [b],
                                   ephemeral: true,
                                   components: []
                              });
                         } else {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE_2', {
                                   SIZE: player.queue.length
                              })
                              b = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              interaction.editReply({
                                   embeds: [b],
                                   components: [],
                                   ephemeral: true
                              })
                         }
                         pressed = true;
                         collector.stop();
                         button.deferUpdate();
                         return;
                    case "3":
                         track = res.tracks[2];
                         player.queue.add(track);
                         let c;
                         if (!player.playing && !player.paused && !player.queue.size) {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE')
                              c = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              player.play();
                              interaction.editReply({
                                   embeds: [c],
                                   ephemeral: true,
                                   components: []
                              });
                         } else {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE_2', {
                                   SIZE: player.queue.length
                              })
                              c = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              interaction.editReply({
                                   embeds: [c],
                                   components: [],
                                   ephemeral: true
                              })
                         }
                         pressed = true;
                         collector.stop();
                         button.deferUpdate();
                         return;
                    case "4":
                         track = res.tracks[3];
                         player.queue.add(track);
                         let d;
                         if (!player.playing && !player.paused && !player.queue.size) {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE')
                              d = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              player.play();
                              interaction.editReply({
                                   embeds: [d],
                                   ephemeral: true,
                                   components: []
                              });
                         } else {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE_2', {
                                   SIZE: player.queue.length
                              })
                              d = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              interaction.editReply({
                                   embeds: [d],
                                   components: [],
                                   ephemeral: true
                              })
                         }
                         pressed = true;
                         collector.stop();
                         button.deferUpdate();
                         return;
                    case "5":
                         track = res.tracks[4];
                         player.queue.add(track);
                         let e;
                         if (!player.playing && !player.paused && !player.queue.size) {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE')
                              e = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              player.play();
                              interaction.editReply({
                                   embeds: [e],
                                   ephemeral: true,
                                   components: []
                              });
                         } else {
                              let title = bot.translate(settings.Language, 'Everyone/search:EMBED_TRACK_QUEUED_TITLE_2', {
                                   SIZE: player.queue.length
                              })
                              e = new EmbedBuilder()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setTitle(title)
                                   .setDescription(`${track.title}`)

                              interaction.editReply({
                                   embeds: [e],
                                   components: [],
                                   ephemeral: true
                              })
                         }
                         pressed = true;
                         collector.stop();
                         button.deferUpdate();
                         return;
               }

          })
          collector.on('end', async collected => {
               if (pressed) return;
               const embed5 = new EmbedBuilder()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Everyone/search:EMBED_TIMELIMIT_REACHED'))

               interaction.editReply({
                    embeds: [embed5],
                    ephemeral: true,
                    components: []
               })
          })
          return;
     }
};