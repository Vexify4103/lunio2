// Dependencies
const {
     MessageEmbed
} = require('discord.js');
const Command = require('../../structures/Command.js');

module.exports = class Play extends Command {
     constructor(bot) {
          super(bot, {
               name: 'play',
               dirname: __dirname,
               aliases: ['p'],
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT_CHANNEL', 'SPEAK', 'VIEW_CHANNEL'],
               description: 'Plays a song or playlist.',
               helpPerms: "Everyone",
               //usage: 'play <song name/url> [flags]',
               usage: 'play <song name/url>',
               cooldown: 3000,
               slash: true,
               music: true,
               reqvc: true,
               options: [{
                    name: 'track',
                    description: 'The link or title of the track.',
                    type: 3,
                    required: true,
               }, {
                    name: 'flags',
                    description: 'Specify extra parameters.',
                    type: 3,
                    required: false,
                    choices: [{
                              name: '-n (next)',
                              value: 'n',
                         },
                         {
                              name: '-s (shuffle)',
                              value: 's',
                         },
                         {
                              name: '-r (reverse)',
                              value: 'r',
                         }
                    ],
               }],
          });
     }
     // Function for slash command
     async callback(bot, interaction, guild, args, settings) {
          let player;
          let embed;
          const member = guild.members.cache.get(interaction.user.id);
          const textchannel = guild.channels.cache.get(interaction.channelId);
          const {
               channel
          } = member.voice;
          const search = interaction.options.getString('track');
          const flags = interaction.options.getString('flags');

          let title;
          try {
               player = bot.manager.create({
                    guild: guild.id,
                    textChannel: textchannel.id,
                    voiceChannel: channel.id,
                    selfDeafen: true
               });
               if (player.state !== "CONNECTED") {
                    player.connect();
               }
          } catch (error) {
               bot.logger.error(`Error creating player ${error}`)
               return;
          }
          title = bot.translate(settings.Language, 'Everyone/play:LOADING_TITLE')
          embed = new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setTitle(title)
               .setDescription(bot.translate(settings.Language, 'Everyone/play:LOADING_DESC'))

          interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
          bot.manager.search(search, member.user).then(async res => {
               let color = await bot.getColor(bot, guild.id);

               if (settings.SongUserLimit > 0 && bot.checkDJ(member, settings)) {
                    res.tracks = res.tracks.slice(0, settings.SongUserLimit)
               }
               if (settings.SongTimeLimitMS > 0 && bot.checkDJ(member, settings)) {
                    res.tracks = res.tracks.filter(song => song.duration <= settings.SongTimeLimitMS)
               }

               const track = res.tracks[0];

               if (!track || res.tracks.length === 0) {
                    embed = new MessageEmbed()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'Everyone/play:NO_MATCHES'))

                    return setTimeout(() => {
                         interaction.editReply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }, bot.ws.ping * 2)
               }
               switch (res.loadType) {
                    case 'NO_MATCHES':
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Everyone/play:NO_MATCHES'))

                         interaction.editReply({
                              embeds: [embed],
                              ephemeral: true
                         })
                         break;

                    case "TRACK_LOADED":
                         bot.logger.log(`Track Loaded: ${track.title}`)
                         player.queue.add(track)

                         if (!player.playing && !player.paused && !player.queue.size) await player.play();

                         if (player.queue.length !== 0) {
                              title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_1', {
                                   pos: player.queue.length
                              })
                              embed = new MessageEmbed()
                                   .setColor(color)
                                   .setTitle(title)
                                   .setDescription(`[${track.title}](${track.uri})`)
                         } else {
                              title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_2')
                              embed = new MessageEmbed()
                                   .setColor(color)
                                   .setTitle(title)
                                   .setDescription(`[${track.title}](${track.uri})`)
                         }
                         setTimeout(() => {
                              interaction.editReply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }, bot.ws.ping * 2)
                         if (settings.CustomChannel) {
                              await bot.musicembed(bot, player, settings)
                         }
                         break;

                    case "SEARCH_RESULT":
                         bot.logger.log(`Track found: ${track.title}`)
                         player.queue.add(track)

                         if (!player.playing && !player.paused && !player.queue.size) await player.play();

                         if (!settings.CustomChannel) {
                              if (player.queue.length !== 0) {
                                   title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_1', {
                                        pos: player.queue.length
                                   })
                                   embed = new MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setDescription(`[${track.title}](${track.uri})`)
                              } else {
                                   title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_2')
                                   embed = new MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setDescription(`[${track.title}](${track.uri})`)
                              }

                              setTimeout(() => {
                                   interaction.editReply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              }, bot.ws.ping * 2)
                         } else {
                              if (player.queue.length !== 0) {
                                   title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_1', {
                                        pos: player.queue.length
                                   })
                                   embed = new MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setDescription(`[${track.title}](${track.uri})`)
                              } else {
                                   title = bot.translate(settings.Language, 'Everyone/play:LOADED_TITLE_2')
                                   embed = new MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setDescription(`[${track.title}](${track.uri})`)
                              }

                              setTimeout(() => {
                                   interaction.editReply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              }, bot.ws.ping * 2)
                              await bot.musicembed(bot, player, settings);
                         }
                         break;

                    case "PLAYLIST_LOADED":
                         let PLAYLIST_LOADED;
                         if (search.includes("&list=RD")) {
                              PLAYLIST_LOADED = new MessageEmbed()
                                   .setColor(color)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_1', {
                                        playlistname: res.playlist.name
                                   }))

                              player.queue.add(res.tracks[0]);

                              if (!player.playing && !player.paused && !player.queue.size) await player.play();

                              setTimeout(() => {
                                   interaction.editReply({
                                        embeds: [PLAYLIST_LOADED],
                                        ephemeral: true
                                   })
                              }, bot.ws.ping * 2)
                         } else {
                              if (settings.Playlists) {
                                   switch (flags) {
                                        case 'n':
                                             res.tracks.shift()

                                             PLAYLIST_LOADED = new MessageEmbed()
                                                  .setColor(color)
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_2', {
                                                       size: res.tracks.length - 1,
                                                       playlistname: res.playlist.name
                                                  }))

                                             player.queue.add(res.tracks);
                                             if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) await player.play();
                                             break;
                                        case 's':
                                             shuffleArray(res.tracks);

                                             PLAYLIST_LOADED = new MessageEmbed()
                                                  .setColor(color)
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_2', {
                                                       size: res.tracks.length,
                                                       playlistname: res.playlist.name
                                                  }))

                                             player.queue.add(res.tracks);
                                             if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) await player.play();
                                             break;
                                        case 'r':
                                             res.tracks.reverse();

                                             PLAYLIST_LOADED = new MessageEmbed()
                                                  .setColor(color)
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_2', {
                                                       size: res.tracks.length,
                                                       playlistname: res.playlist.name
                                                  }))

                                             player.queue.add(res.tracks);
                                             if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) await player.play();
                                             break;
                                        default:
                                             PLAYLIST_LOADED = new MessageEmbed()
                                                  .setColor(color)
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_2', {
                                                       size: res.tracks.length,
                                                       playlistname: res.playlist.name
                                                  }))

                                             player.queue.add(res.tracks);
                                             if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) await player.play();
                                             break;
                                   }
                              } else {
                                   PLAYLIST_LOADED = new MessageEmbed()
                                        .setColor(bot.config.colorOrange)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_NOT_ALLOWED'))
                              }
                              setTimeout(() => {
                                   interaction.editReply({
                                        embeds: [PLAYLIST_LOADED],
                                        ephemeral: true
                                   })
                              }, bot.ws.ping * 2)
                         }
                         if (settings.CustomChannel) {
                              await bot.musicembed(bot, player, settings)
                         }
                         break;
               }
          });

          function shuffleArray(array) {
               for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
               }
          }
     }
};