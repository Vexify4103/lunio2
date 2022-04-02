// Dependencies
const Command = require('../../structures/Command.js');
const {
     paginate
} = require('../../utils');
const {
     MessageEmbed,
} = require("discord.js");
const {
     PlaylistSchema
} = require('../../database/models');
const {
     TrackUtils
} = require('erela.js');

module.exports = class Playlist extends Command {
     constructor(bot) {
          super(bot, {
               name: 'playlist',
               helpPerms: "Everyone",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Play your saved default playlist.',
               slash: true,
               usage: 'playlist load',
               music: true,
               reqplayer: false,
               reqvc: false,
               options: [{
                    // COMMAND #1
                    name: 'list',
                    description: 'List your saved playlists.',
                    type: 1,
               }, {
                    // COMMAND #2
                    name: 'show',
                    description: 'Show the songs within the provided playlist.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true,
                    }, {
                         name: 'page-number',
                         description: 'Shows a specific page of the provided playlist.',
                         type: 4,
                         required: false
                    }]
               }, {
                    // COMMAND #3
                    name: 'song-save',
                    description: 'Save a song to your default or provided playlist.',
                    type: 1,
                    options: [{
                         name: 'url',
                         description: 'Please provide URL to save to your playlist.',
                         type: 3,
                         required: true
                    }, {
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: false,
                    }]
               }, {
                    // COMMAND #4
                    name: 'song-delete',
                    description: 'Delete a song from your default or provided playlist.',
                    type: 1,
                    options: [{
                         name: 'song-id',
                         description: 'Song-ID (Number) you want to be removed out of the provided playlist.',
                         type: 4,
                         required: true
                    }, {
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: false,
                    }]
               }, {
                    // COMMAND #5 / 0.5*premium 0.5*everyone
                    name: 'load',
                    description: 'Play the provided saved playlist.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: false
                    }]
               }, {
                    // COMMAND #6 / PREMIUM
                    name: 'save',
                    description: 'Save the current queue as a private playlist.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true
                    }]
               }, {
                    // COMMAND #7 / PREMIUM
                    name: 'create',
                    description: 'Create a new playlist.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true
                    }]
               }, {
                    // COMMAND #8 / PREMIUM
                    name: 'delete',
                    description: 'Delete the provided saved playlist.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true
                    }]
               }, {
                    // COMMAND #9 / PREMIUM
                    name: 'default',
                    description: 'Switch the default playlist (used when no playlist name is provided).',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true
                    }]
               }, {
                    // COMMAND #10 / PREMIUM
                    name: 'share',
                    description: 'Share your saved playlists with others.',
                    type: 1,
                    options: [{
                         name: 'playlist-name',
                         description: 'Name of the playlist.',
                         type: 3,
                         required: true
                    }]
               }],
               methods: [{
                    name: 'list',
                    description: 'List your saved playlists.',
                    perms: 'Everyone'
               }, {
                    name: 'show <playlist-name> [page-number]',
                    description: 'Show the songs within the provided playlist.',
                    perms: 'Everyone'
               }, {
                    name: 'song save <url> [playlist-name]',
                    description: 'Save a song to your default or provided playlist.',
                    perms: 'Everyone'
               }, {
                    name: 'song delete <songId> [playlist-name]',
                    description: 'Delete a song from your default or provided playlist.',
                    perms: 'Everyone'
               }, {
                    name: 'save <playlist-name>',
                    description: 'Save the current queue as a private playlist.',
                    perms: 'Premium'
               }, {
                    name: 'create <playlist-name>',
                    description: 'Create a new playlist.',
                    perms: 'Premium'
               }, {
                    name: 'delete <playlist-name>',
                    description: 'Delete the provided saved playlist.',
                    perms: 'Premium'
               }, {
                    name: 'default <playlist-name>',
                    description: 'Switch the default playlist (used when no playlist name is provided).',
                    perms: 'Premium'
               }, {
                    name: 'share <playlist-name>',
                    description: 'Share your saved playlists with others.',
                    perms: 'Premium'
               }],
          });
     }

     async callback(bot, interaction, guild, args, settings) {
          const Sub = interaction.options.getSubcommand(["list", "show", "song-save", "song-delete", "load", "save", "create", "delete", "default", "share"]);
          let embed;
          const userSettings = await bot.getUserData(bot, interaction.user.id);
          const member = guild.members.cache.get(interaction.user.id);
          const PlaylistName = interaction.options.getString('playlist-name');
          const ULR = interaction.options.getString('url');
          const Page = interaction.options.getInteger('page-number');
          const SongId = interaction.options.getInteger('song-id');
          const exist = await bot.existPlaylist(interaction.user.id, (PlaylistName || userSettings.defaultPlaylist));
          const player = bot.manager.players.get(guild.id);

          switch (Sub) {
               case "list": // NOTHING REQUIRED
                    PlaylistSchema.find({
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }

                         if (!p[0]) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))
                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         } else {
                              let str = [];
                              let count = 0;
                              p.map(pl => {
                                   str.push(`${count += 1}. ${bot.codeBlock(pl.name)} created: ${pl.timeCreated}\n\n`)
                              });
                              embed = new MessageEmbed()
                                   .setColor(await bot.getColor(bot, guild.id))
                                   .setDescription(`${str.join("")}`)

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                    })
                    break;
               case "show": // PLAYLIST NAME REQUIRED, PAGE NOT REQUIRED
                    PlaylistSchema.find({
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))
                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }

                         if (!p[0]) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))
                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         } else {
                              let playlistNames = p.map(pl => pl.name);

                              if (playlistNames.includes(PlaylistName)) {
                                   p = p.find(obj => obj.name == PlaylistName);

                                   // Show information on that playlist
                                   let pagesNum = Math.ceil(p.songs.length / 10);
                                   if (pagesNum === 0) pagesNum = 1;

                                   // Get total playlist duration
                                   const totalQueueDuration = p.songs.reduce((a, b) => a + b.duration, 0);

                                   const pages = [];
                                   let n = 1;
                                   if (pagesNum === 0) pagesNum = 1;

                                   for (let i = 0; i < pagesNum; i++) {
                                        const str = `${p.songs.slice(i * 10, i * 10 + 10).map(song => `${n++}. ${song.author} - ${song.title} \`[${bot.getduration(song.duration)}]\``).join('\n')}`;

                                        embed = new MessageEmbed()
                                             .setColor(await bot.getColor(bot, guild.id))
                                             .setDescription(str)
                                             .setFooter({
                                                  text: bot.translate(settings.Language, 'Everyone/playlist:EMBED_SHOW_CURRENT_PAGE', {
                                                       current: i + 1,
                                                       total: pagesNum,
                                                       size: p.songs.length,
                                                       duration: bot.getduration(totalQueueDuration)
                                                  }),
                                             })
                                        pages.push(embed);
                                   }

                                   if (!Page || Page == 'null') {
                                        paginate(bot, interaction, pages, interaction.user.id)
                                   } else {
                                        if (Page > pagesNum) {
                                             Page = pagesNum;
                                        }
                                        let pageNum = Page == 0 ? 1 : Page - 1;

                                        return interaction.reply({
                                             embeds: [pages[pageNum]],
                                             ephemeral: true
                                        })
                                   }
                              } else {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorWrong)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLISTNAME_FOUND', {
                                             name: PlaylistName
                                        }))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   });
                              }
                         }
                    })
                    break;
               case "song-save": // URL required, PlaylistName not required
                    if (exist === false) {
                         let plsettings;

                         if (userSettings.premium) {
                              plsettings = {
                                   name: PlaylistName || "Songs",
                                   creator: interaction.user.id
                              }
                              let updateUser = {
                                   defaultPlaylist: PlaylistName
                              }
                              await bot.updateUserSettings(interaction.user, updateUser);
                         } else {
                              plsettings = {
                                   name: "Songs",
                                   creator: interaction.user.id
                              }
                         }
                         await bot.createPlaylist(bot, plsettings);

                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_CREATED_NEW_DEFAULT', {
                                   name: plsettings.name
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    PlaylistSchema.findOne({
                         name: PlaylistName || userSettings.defaultPlaylist,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }

                         if (p) {
                              let res = await bot.manager.search(ULR, member.user);
                              if ((p.songs.length >= 15 && !userSettings.premium) || (p.songs.length >= 100 && userSettings.premium)) {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorOrange)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              }
                              if (res.loadType === "NO_MATCHES") {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorOrange)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_SONGS_FOUND'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              } else if (res.loadType === "PLAYLIST_LOADED") {
                                   if (ULR.includes("&list=RD")) {
                                        p.songs.push(res.tracks[0])
                                        p.duration = p.duration + res.tracks[0].duration;
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorTrue)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_SONGSAVE_LOADED', {
                                                  name: res.playlist.name
                                             }))

                                        interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        })
                                        return await p.save();
                                   } else {
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorWrong)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_AT_LEAST_1SONG'))

                                        return interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        })
                                   }
                              } else if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
                                   p.songs.push(res.tracks[0])
                                   p.duration = p.duration + res.tracks[0].duration;
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_ADDED_TRACK_TO_PLAYLIST', {
                                             author: res.tracks[0].author,
                                             title: res.tracks[0].title,
                                             playlistname: p.name
                                        }))

                                   interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                                   return await p.save();
                              }
                         } else {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }

                    })
                    break;
               case "song-delete": // SONGID required, PlaylistName not required
                    if (!exist) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         });
                    }
                    PlaylistSchema.findOne({
                         name: PlaylistName || userSettings.defaultPlaylist,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))
                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (p) {
                              try {
                                   p.songs.splice(SongId - 1, 1);

                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(`Successfully removed song at position ${bot.codeBlock(SongId)}.`)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REMOVED_TRACK_FROM_PLAYLIST', {
                                             songID: SongId
                                        }))

                                   await interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                                   return await p.save();
                              } catch (error) {
                                   bot.logger.error(error)
                              }
                         } else {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                    })
                    break;
               case "load": // PlaylistName required

                    // CHECK IF PLAYLIST ARE ALLOWED
                    if (!settings.Playlists) {
                         let embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/play:PL_NOT_ALLOWED'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    
                    if (!PlaylistName) {
                         // ALL CHECKS BEORE PLAYING (DJ ROLE, RESTRICTED VC, SAME VC)
                         // CHECK FOR DJ
                         if (!bot.checkDJ(member, settings)) {
                              let embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_A_DJ'))

                              return interaction.reply({
                                   embeds: [embed],
                              })
                         }
                         // CHECK IF USER IS IN VC
                         const {
                              channel
                         } = member.voice;
                         if (!channel) {
                              let embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_VC'))

                              return await interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // CHECK IF USER IS IN *SAME* VC
                         if (player && (channel.id !== player.voiceChannel)) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone:playlist:EMBED_NOT_SAME_VC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // CHECK FOR RESTRICTED VC
                         if (!bot.checkVC(member, settings)) {
                              let str = [];
                              VCs.map(v => {
                                   str.push(`<#${v}>`)
                              });

                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(`${bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_ALLOWED_TO_JOIN')} ${str.join("\n")}`)

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // RUN COMMAND
                         PlaylistSchema.findOne({
                              name: userSettings.defaultPlaylist,
                              creator: interaction.user.id
                         }, async (err, p) => {
                              if (err) {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorWrong)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_COULDNT_FIND_DEFAULT'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   });
                              }
                              if (p) {
                                   let player;
                                   let title = bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_TITLE')
                                   embed = new MessageEmbed()
                                        .setColor(await bot.getColor(bot, guild.id))
                                        .setTitle(title)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_DESC'))

                                   await interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true,
                                        fetchReply: true
                                   })
                                   try {
                                        player = bot.manager.create({
                                             guild: guild.id,
                                             voiceChannel: member.voice.channel.id,
                                             textChannel: interaction.channel.id,
                                             selfDeafen: true,
                                        });
                                        player.connect();
                                        new Promise(async function (resolve) {
                                             for (let i = 0; i < p.songs.length; i++) {
                                                  player.queue.add(TrackUtils.buildUnresolved({
                                                       title: p.songs[i].title,
                                                       author: p.songs[i].author,
                                                       duration: p.songs[i].duration,
                                                  }, member.user));
                                                  if (!player.playing && !player.paused && !player.queue.length) player.play();
                                                  if (i == p.songs.length - 1) resolve();
                                             }
                                        });

                                        const loaded = new MessageEmbed()
                                             .setColor(await bot.getColor(bot, guild.id))
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADED_PALYLIST', {
                                                  size: p.songs.length,
                                                  playlistname: p.name
                                             }))

                                        interaction.editReply({
                                             embeds: [loaded],
                                             ephemeral: true
                                        })
                                   } catch (error) {
                                        bot.logger.error(error)
                                   }
                              } else {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorWrong)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   });
                              }
                         })
                    } else {
                         // CHECK FOR USER PREMIUM
                         if (!userSettings.premium) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // ALL CHECKS BEORE PLAYING (DJ ROLE, RESTRICTED VC, SAME VC)
                         // CHECK FOR DJ
                         if (!bot.checkDJ(member, settings)) {
                              let embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_A_DJ'))

                              return interaction.reply({
                                   embeds: [embed],
                              })
                         }
                         // CHECK IF USER IS IN VC
                         const {
                              channel
                         } = member.voice;
                         if (!channel) {
                              let embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_VC'))

                              return await interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // CHECK IF USER IS IN *SAME* VC
                         if (player && (channel.id !== player.voiceChannel)) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_SAME_VC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         // CHECK FOR RESTRICTED VC
                         if (!bot.checkVC(member, settings)) {
                              let str = [];
                              VCs.map(v => {
                                   str.push(`<#${v}>`)
                              });

                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(`${bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_ALLOWED_TO_JOIN')} ${str.join("\n")}`)

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                         //RUN COMMAND
                         if (PlaylistName.startsWith("_id:")) {
                              PlaylistSchema.findById({
                                   _id: PlaylistName.slice(4)
                              }, async (err, p) => {
                                   if (err) {
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorWrong)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_COULDNT_FIND_PLAYLIST'))

                                        return interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        });
                                   }
                                   if (p) {
                                        let player;
                                        let title = bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_TITLE')
                                        embed = new MessageEmbed()
                                             .setColor(await bot.getColor(bot, guild.id))
                                             .setTitle(title)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_DESC'))

                                        await interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true,
                                             fetchReply: true
                                        })
                                        try {
                                             player = bot.manager.create({
                                                  guild: guild.id,
                                                  voiceChannel: member.voice.channel.id,
                                                  textChannel: interaction.channel.id,
                                                  selfDeafen: true,
                                             });
                                             player.connect();
                                             const content = new Promise(async function (resolve) {
                                                  for (let i = 0; i < p.songs.length; i++) {
                                                       player.queue.add(TrackUtils.buildUnresolved({
                                                            title: p.songs[i].title,
                                                            author: p.songs[i].author,
                                                            duration: p.songs[i].duration,
                                                       }, member.user));
                                                       if (!player.playing && !player.paused && !player.queue.length) player.play();
                                                       if (i == p.songs.length - 1) resolve();
                                                  }
                                             });

                                             const loaded = new MessageEmbed()
                                                  .setColor(await bot.getColor(bot, guild.id))
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADED_PALYLIST', {
                                                       size: p.songs.length,
                                                       playlistname: p.name
                                                  }))

                                             interaction.editReply({
                                                  embeds: [loaded],
                                                  ephemeral: true
                                             })
                                        } catch (error) {
                                             bot.logger.error(`Error creating player ${error}`)
                                        }
                                   } else {
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorWrong)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                                        return interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        });
                                   }
                              })
                         } else {
                              PlaylistSchema.findOne({
                                   name: PlaylistName || userSettings.defaultPlaylist,
                                   creator: interaction.user.id
                              }, async (err, p) => {
                                   if (err) {
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorWrong)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_COULDNT_FIND_PLAYLIST'))

                                        return interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        });
                                   }
                                   if (p) {
                                        let player;
                                        let title = bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_TITLE')
                                        embed = new MessageEmbed()
                                             .setColor(await bot.getColor(bot, guild.id))
                                             .setTitle(title)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADING_PLAYLIST_DESC'))

                                        const loading = await interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true,
                                             fetchReply: true
                                        })
                                        try {
                                             player = bot.manager.create({
                                                  guild: guild.id,
                                                  voiceChannel: member.voice.channel.id,
                                                  textChannel: interaction.channel.id,
                                                  selfDeafen: true,
                                             });
                                             player.connect();
                                             const content = new Promise(async function (resolve) {
                                                  for (let i = 0; i < p.songs.length; i++) {
                                                       player.queue.add(TrackUtils.buildUnresolved({
                                                            title: p.songs[i].title,
                                                            author: p.songs[i].author,
                                                            duration: p.songs[i].duration,
                                                       }, member.user));
                                                       if (!player.playing && !player.paused && !player.queue.length) player.play();
                                                       if (i == p.songs.length - 1) resolve();
                                                  }
                                             });

                                             const loaded = new MessageEmbed()
                                                  .setColor(await bot.getColor(bot, guild.id))
                                                  .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_LOADED_PALYLIST', {
                                                       size: p.songs.length,
                                                       playlistname: p.name
                                                  }))

                                             interaction.editReply({
                                                  embeds: [loaded],
                                                  ephemeral: true
                                             })
                                        } catch (error) {
                                             bot.logger.error(error)
                                        }
                                   } else {
                                        embed = new MessageEmbed()
                                             .setColor(bot.config.colorWrong)
                                             .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                                        return interaction.reply({
                                             embeds: [embed],
                                             ephemeral: true
                                        });
                                   }
                              })
                         }
                    }

                    break;
               case "save": // PlaylistName required
                    if (!userSettings.premium) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    if (!player) {
                         let embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_BOT_NOT_PLAYING'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }

                    let queue = player.queue;
                    if (queue.size == 0) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_SONG_IN_QUEUE'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true,
                         });
                    }

                    PlaylistSchema.findOne({
                         name: PlaylistName,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_ERROR_CREATING_PLAYLIST'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (!p) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         } else {
                              if ((p.songs.length >= 15 && !userSettings.premium) || (p.songs.length >= 100 && userSettings.premium)) {
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorOrange)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              }
                              try {
                                   let current = {
                                        requester: member.user,
                                        title: queue.current.title,
                                        author: queue.current.author,
                                        duration: queue.current.duration
                                   }
                                   p.songs.push(current)
                                   let songstopush = queue.slice(0, userSettings.premium ? 99 : 14);

                                   songstopush.map(track => {
                                        p.songs.push(track)
                                        p.duration += track.duration
                                   })
                                   await p.save()

                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_SAVED_CURRENT_QUEUE_AS_PLAYLIST', {
                                             size: songstopush.length + 1,
                                             playlistname: p.name
                                        }))
                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              } catch (error) {
                                   bot.logger.error(`Error saving current queue to paylist ${error}`)
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorWrong)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_ERROR_DELETING_PLAYLIST'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   });
                              }
                         }
                    })
                    break;
               case "create": // PlaylistName required
                    if (!userSettings.premium) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    PlaylistSchema.find({
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_ERROR_CREATING_PLAYLIST'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (p.length >= 5) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT'))
                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         } else {
                              let plsettings = {
                                   name: PlaylistName,
                                   creator: interaction.user.id
                              }
                              await bot.createPlaylist(bot, plsettings);
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorTrue)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_SUCCESS_CREATING_PLAYLIST', {
                                        playlistname: PlaylistName
                                   }))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         }
                    })
                    break;
               case "delete": // PlaylistName required
                    if (!userSettings.premium) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }

                    PlaylistSchema.findOne({
                         name: PlaylistName,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_COULDNT_FIND_PLAYLIST'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });

                         }
                         if (!p) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         } else {
                              try {
                                   let xsettings = {
                                        defaultPlaylist: "Songs"
                                   }
                                   await bot.deletePlaylist(interaction.user.id, p.name);
                                   await bot.updateUserSettings(interaction.user, xsettings);

                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_SUCCESS_DELETING_PLAYLIST'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   })
                              } catch (error) {
                                   bot.logger.error(error)
                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorWrong)
                                        .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_ERROR_DELETING_PLAYLIST'))

                                   return interaction.reply({
                                        embeds: [embed],
                                        ephemeral: true
                                   });
                              }
                         }
                    })
                    break;
               case "default": // PlaylistName required
                    if (!userSettings.premium) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }

                    PlaylistSchema.find({
                         name: PlaylistName,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_COULDNT_FIND_PLAYLIST'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (!p[0]) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (p) {
                              let settingsToUpdate = {
                                   defaultPlaylist: PlaylistName
                              }
                              await bot.updateUserSettings(interaction.user, settingsToUpdate);

                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorTrue)
                                   .setDescription(`Updated your default playlist to ${bot.codeBlock(PlaylistName)}.`)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_UPDATED_DEFAULT_PLAYLIST', {
                                        playlistname: PlaylistName
                                   }))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         } else {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                    })
                    break;
               case "share": // PlaylistName required
                    if (!userSettings.premium) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_REQUIRES_PREMIUM'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }

                    PlaylistSchema.find({
                         name: PlaylistName,
                         creator: interaction.user.id
                    }, async (err, p) => {
                         if (err) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translaet('Everyone/playlist:EMBED_COULDNT_FIND_PLAYLIST'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (!p[0]) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                         if (p) {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorTrue)
                                   .setDescription(`Playlist ${bot.codeBlock(p[0].name)} can be shared via ${bot.codeBlock(`/playlist load _id:${p[0]._id}`)}`)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_SHARE_PLAYLIST', {
                                        playlistname: p[0].name,
                                        id: p[0]._id
                                   }))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              })
                         } else {
                              embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/playlist:EMBED_NO_PLAYLIST_DESC'))

                              return interaction.reply({
                                   embeds: [embed],
                                   ephemeral: true
                              });
                         }
                    })
                    break;

               default:
                    break;
          }
     }
};