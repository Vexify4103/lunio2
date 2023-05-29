// Dependencies
const Command = require("../../structures/Command.js");
const { paginate } = require("../../utils");
const { EmbedBuilder } = require("discord.js");
const { PlaylistSchema } = require("../../database/models");
const { TrackUtils } = require("erela.js");

module.exports = class Playlist extends Command {
	constructor(bot) {
		super(bot, {
			name: "playlist",
			helpPerms: "Everyone",
			dirname: __dirname,
			description: "Play your saved default playlist.",
			slash: true,
			usage: "playlist load",
			music: true,
			reqplayer: false,
			reqvc: false,
			options: [
				{
					// COMMAND #1
					name: "list",
					description: "List your saved playlists.",
					type: 1,
				},
				{
					// COMMAND #2
					name: "show",
					description: "Show the songs within the provided playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
						{
							name: "page-number",
							description:
								"Shows a specific page of the provided playlist.",
							type: 10,
							required: false,
							min_value: 1,
						},
					],
				},
				{
					// COMMAND #3
					name: "song-save",
					description:
						"Save a song to your default or provided playlist.",
					type: 1,
					options: [
						{
							name: "track",
							description: "The link or title of the track.",
							type: 3,
							required: true,
							autocomplete: true,
						},
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					// COMMAND #4
					name: "song-delete",
					description:
						"Delete a song from your default or provided playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
						{
							name: "song-id",
							autocomplete: true,
							description:
								"Song-ID (Number) you want to be removed out of the provided playlist.",
							type: 10,
							min_value: 1,
							required: true,
						},
					],
				},
				{
					// COMMAND #5 / 0.5*premium 0.5*everyone
					name: "load",
					description: "Play the provided or default playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: false,
							autocomplete: true,
						},
					],
				},
				{
					// COMMAND #6 / PREMIUM
					name: "save",
					description:
						"Save the current queue as a private playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					// COMMAND #7 / PREMIUM
					name: "create",
					description: "Create a new playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
						},
					],
				},
				{
					// COMMAND #8 / PREMIUM
					name: "delete",
					description: "Delete the provided saved playlist.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					// COMMAND #10 / PREMIUM
					name: "share",
					description: "Share your saved playlists with others.",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					// COMMAND #9 / PREMIUM
					name: "default",
					description:
						"Switch the default playlist. (used when no playlist name is provided)",
					type: 1,
					options: [
						{
							name: "playlist-name",
							description: "Name of the playlist.",
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
			],
			methods: [
				{
					name: "list",
					description: "List your saved playlists.",
					perms: "Everyone",
				},
				{
					name: "show <playlist-name> [page-number]",
					description: "Show the songs within the provided playlist.",
					perms: "Everyone",
				},
				{
					name: "song save <title/url> <playlist-name>",
					description:
						"Save a song to your default or provided playlist.",
					perms: "Everyone",
				},
				{
					name: "song delete <songID> <playlist-name>",
					description: "Delete a song from your playlist.",
					perms: "Everyone",
				},
				{
					name: "load [playlist-name]",
					description: "Loads the given or your default playlist.",
					perms: "Premium",
				},
				{
					name: "save <playlist-name>",
					description:
						"Save the current queue as a private playlist.",
					perms: "Premium",
				},
				{
					name: "create <playlist-name>",
					description: "Create a new playlist.",
					perms: "Premium",
				},
				{
					name: "delete <playlist-name>",
					description: "Delete the provided saved playlist.",
					perms: "Premium",
				},
				{
					name: "share <playlist-name>",
					description: "Share your saved playlists with others.",
					perms: "Premium",
				},
				{
					name: "default <playlist-name>",
					description:
						"Switch the default playlist. (used when no playlist name is provided)",
					perms: "Premium",
				},
			],
		});
	}

	async callback(bot, interaction, guild, args, settings) {
		const Sub = interaction.options.getSubcommand([
			"list",
			"show",
			"song-save",
			"song-delete",
			"load",
			"save",
			"create",
			"delete",
			"default",
			"share",
		]);
		let embed;
		let userSettings = await bot.getUserData(bot, interaction.user.id);
		let member = await guild.members.fetch(interaction.user.id);
		let playlistName = interaction.options.getString("playlist-name");
		let track = interaction.options.getString("track");
		let pageNumber = interaction.options.getNumber("page-number");
		let songID = interaction.options.getNumber("song-id");
		let player = bot.manager?.players?.get(guild.id);
		let maxSongsInPlaylist = userSettings.maxSongsInPlaylist;
		await interaction.deferReply({ ephemeral: true });
		let playlistArray;

		switch (Sub) {
			case "list": // NOTHING REQUIRED
				playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				let str = [];
				let count = 0;
				playlistArray.map((pl) => {
					str.push(
						`${(count += 1)}. ${bot.codeBlock(
							pl.name
						)} ${bot.translate(
							settings.Language,
							"Everyone/playlist:LIST_PLAYLISTS"
						)}: ${pl.timeCreated}\n\n`
					);
				});
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`${str.join("")}`);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
				break;
			case "show": // PLAYLIST NAME REQUIRED, PAGE NOT REQUIRED
				playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
					name: playlistName,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];
				// CHECK IF PLAYLIST HAS ANY SONGS
				if (playlistArray.songs.length <= 0) {
					// RETURN ERROR IF NO SONGS IN THIS PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_PLAYLIST_EMPTY"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// Show information on that playlist
				let pagesNum = Math.ceil(playlistArray.songs.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				// Get total playlist duration
				const totalQueueDuration = playlistArray.songs.reduce(
					(a, b) => a + b.duration,
					0
				);

				const pagesArray = [];
				let n = 1;
				if (pagesNum === 0) pagesNum = 1;

				for (let i = 0; i < pagesNum; i++) {
					const str = `${playlistArray.songs
						.slice(i * 10, i * 10 + 10)
						.map(
							(song) =>
								`${n++}. ${song.author} - ${
									song.title
								} \`[${bot.getduration(song.duration)}]\``
						)
						.join("\n")}`;

					embed = new EmbedBuilder()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(str)
						.setFooter({
							text: bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_SHOW_CURRENT_PAGE",
								{
									CURRENT: i + 1,
									TOTAL: pagesNum,
									SIZE: playlistArray.songs.length,
									DURATION:
										bot.getduration(totalQueueDuration),
								}
							),
						});
					pagesArray.push(embed);
				}

				if (!pageNumber || pageNumber == null) {
					paginate(bot, interaction, pagesArray, interaction.user.id);
				} else {
					if (pageNumber > pagesNum) pageNumber = pagesNum;

					let pageNum = pageNumber == 0 ? 1 : pageNumber - 1;

					return interaction.editReply({
						embeds: [pagesArray[pageNum]],
						ephemeral: true,
					});
				}
				break;
			case "song-save": // URL-TRACK required, playlistName required
				playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
					name: playlistName,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];

				// Search for song using userInput
				let res = await bot.manager.search(track, member.user);
				res.tracks = await bot.replaceCredentials(bot, res);
				// CHECK IF USER HAS ENOUGH SPACE IN PLAYLIST
				if (
					(playlistArray.songs.length >=
						bot.config.changeableSettings.maxSongsInPlaylist &&
						!userSettings.premium) ||
					(playlistArray.songs.length >= maxSongsInPlaylist &&
						userSettings.premium)
				) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				if (res.loadType === "NO_MATCHES") {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_SONGS_FOUND"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				} else if (res.loadType === "PLAYLIST_LOADED") {
					if (track.includes("&list=RD")) {
						playlistArray.songs.push(res.tracks[0]);
						playlistArray.duration += res.tracks[0].duration;
						embed = new EmbedBuilder()
							.setColor(await bot.getColor(bot, guild.id))
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/playlist:EMBED_SONGSAVE_LOADED",
									{
										NAME: res.playlist.name,
									}
								)
							);

						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
						return await playlistArray.save();
					} else {
						embed = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/playlist:EMBED_ONLY_1SONG"
								)
							);

						return interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					}
				} else if (
					res.loadType === "TRACK_LOADED" ||
					res.loadType === "SEARCH_RESULT"
				) {
					let finalResult = await bot.manager.search(
						`${res.tracks[0].author} - ${res.tracks[0].title}`,
						member.user
					);
					res.tracks = await bot.replaceCredentials(bot, finalResult);

					if (finalResult.loadType === "NO_MATCHES") {
						embed = new EmbedBuilder()
							.setColor(bot.config.colorOrange)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/playlist:EMBED_NO_SONGS_FOUND"
								)
							);

						return interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					} else if (finalResult.loadType === "PLAYLIST_LOADED") {
						if (track.includes("&list=RD")) {
							playlistArray.songs.push(finalResult.tracks[0]);
							playlistArray.duration +=
								finalResult.tracks[0].duration;
							embed = new EmbedBuilder()
								.setColor(await bot.getColor(bot, guild.id))
								.setDescription(
									bot.translate(
										settings.Language,
										"Everyone/playlist:EMBED_SONGSAVE_LOADED",
										{
											NAME: `${bot.codeBlock(
												finalResult.playlist.name
											)}`,
										}
									)
								);

							interaction.editReply({
								embeds: [embed],
								ephemeral: true,
							});
							return await playlistArray.save();
						} else {
							embed = new EmbedBuilder()
								.setColor(bot.config.colorWrong)
								.setDescription(
									bot.translate(
										settings.Language,
										"Everyone/playlist:EMBED_ONLY_1SONG"
									)
								);

							return interaction.editReply({
								embeds: [embed],
								ephemeral: true,
							});
						}
					}

					playlistArray.songs.push(finalResult.tracks[0]);
					playlistArray.duration += finalResult.tracks[0].duration;

					embed = new EmbedBuilder()
						.setColor(bot.config.colorTrue)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_ADDED_TRACK_TO_PLAYLIST",
								{
									TRACK: `${finalResult.tracks[0].author} - ${finalResult.tracks[0].title}`,
									PLAYLISTNAME: playlistArray.name,
								}
							)
						);

					interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
					return await playlistArray.save();
				}
				break;
			case "song-delete": // SONGID required, playlistName required
				playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
					name: playlistName,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];

				// RETURN ERROR IF SONG DOES NOT EXIST IN THE PLAYLIST
				if (songID > playlistArray.songs.length) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_TRACK_NOT_EXIST_IN_PLAYLIST"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// TRY REMOVING SONG WITH ID
				try {
					//console.log(playlistArray.songs[songID - 1].title);

					("Successfully removed song `{{SONGTITLE}}` at position `{{SONGID}}`");
					embed = new EmbedBuilder()
						.setColor(bot.config.colorTrue)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REMOVED_TRACK_FROM_PLAYLIST",
								{
									SONGTITLE:
										playlistArray.songs[songID - 1].title,
									SONGID: songID,
								}
							)
						);

					playlistArray.duration -=
						playlistArray.songs[songID - 1].duration;
					playlistArray.songs.splice(songID - 1, 1);
					await playlistArray.save();
					await interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				} catch (error) {
					bot.logger.error(error);
				}
				break;
			case "load": // playlistName not required
				// CHECK IF PLAYLIST ARE ALLOWED
				if (!settings.Playlists) {
					let embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/play:PL_NOT_ALLOWED"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				if (!playlistName || playlistName == "null")
					playlistName = userSettings.defaultPlaylist;
				// IF PLAYLIST IS A SHARED ONE
				if (playlistName.startsWith("_id:")) {
					playlistArray = await PlaylistSchema.findById({
						_id: playlistName.slice(4),
					}).exec();
				} else {
					playlistArray = await PlaylistSchema.find({
						creator: interaction.user.id,
						name: playlistName,
					}).exec();
					// GET INTO THE FIRST PLAYLIST THAT MATCHES
					playlistArray = playlistArray[0];
				}
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// CHECK IF PLAYLIST HAS ANY SONGS
				if (playlistArray.songs.length <= 0) {
					// RETURN ERROR IF NO SONGS IN THIS PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_PLAYLIST_EMPTY"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				await checkMusic(bot, interaction, settings, member, player);

				try {
					player = bot.manager.create({
						guild: guild.id,
						voiceChannel: member.voice.channel.id,
						textChannel: interaction.channel.id,
						selfDeafen: true,
						volume: settings.DefaultVol,
					});
					if (player.state !== "CONNECTED") {
						player.connect();
					}

					// ADD ALL SONGS TO QUEUE
					let failedSongsArray = [];

					for (let i = 0; i < playlistArray.songs.length; i++) {
						const song = playlistArray.songs[i];
						try {
							bot.manager
								.search(
									`${song.author} - ${song.title}`,
									member.user
								)
								.then(async (res) => {
									res.tracks = await bot.replaceCredentials(
										bot,
										res
									);
									await bot.delay(bot, 100);

									let track = res.tracks[0];
									// console.log(track);
									switch (res.loadType) {
										case "NO_MATCHES":
											failedSongsArray.push(
												failedSongsArray`${song.author} - ${song.title}`
											);
											break;
										case "TRACK_LOADED":
											bot.logger.log(
												`${
													guild.id
												} ${res.loadType.toLowerCase()}: ${
													track.author
												} - ${track.title}`
											);
											player.queue.add(track);
											if (
												!player.playing &&
												!player.paused &&
												!player.queue.size
											) {
												await player.play();
											}
											break;
										case "SEARCH_RESULT":
											bot.logger.log(
												`${
													guild.id
												} ${res.loadType.toLowerCase()}: ${
													track.author
												} - ${track.title}`
											);
											player.queue.add(track);
											if (
												!player.playing &&
												!player.paused &&
												!player.queue.size
											) {
												await player.play();
											}
											break;
										case "PLAYLIST_LOADED":
											bot.logger.log(
												`${
													msg.guild.id
												} ${res.loadType.toLowerCase()}: ${
													res.playlist.name
												}`
											);
											player.queue.add(track);
											if (
												!player.playing &&
												!player.paused &&
												!player.queue.size
											) {
												await player.play();
											}
											break;
									}
								});
						} catch (error) {
							failedSongsArray.push(
								`${song.author} - ${song.title}`
							);
							bot.logger.error(error);
						}
					}

					if (settings.CustomChannel) {
						await bot.delay(bot, 500);
						await bot.musicembed(bot, player, settings);
					}
					embed = new EmbedBuilder()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_LOADED_PALYLIST",
								{
									SIZE:
										playlistArray.songs.length -
										failedSongsArray.length,
									PLAYLISTNAME: playlistArray.name,
								}
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				} catch (error) {
					bot.logger.error(error);
				}
				break;
			case "save": // playlistName required
				// CHECK IF USER HAS PREMIUM
				if (!userSettings.premium) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REQUIRES_PREMIUM"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// CHECK IF PLAYER EXISTS
				if (!player) {
					let embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_BOT_NOT_PLAYING"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				let queue = player.queue;
				// CHECK IF PLAYER HAS A QUEUE
				if (queue.size == 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_SONG_IN_QUEUE"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				playlistArray = await PlaylistSchema.find({
					name: playlistName,
					creator: interaction.user.id,
				}).exec();
				// CHECK IF USER HAS A PLAYLIST
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];
				// CHECK IF USER HAS ENOUGH SPACE IN HIS PLAYLIST
				if (playlistArray.songs.length >= maxSongsInPlaylist) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				let pushedAmount = 1;
				let durationToAdd = 0;
				// TRY TO SAVE QUEUE AS A PLAYLIST
				try {
					let current = player.queue.current;

					playlistArray.songs.push(current);
					durationToAdd + current.duration;

					let maxSongsToPush = Math.min(
						maxSongsInPlaylist - playlistArray.songs.length,
						player.queue.length
					);
					for (let i = 0; i < maxSongsToPush; i++) {
						pushedAmount += 1;
						const song = player.queue[i];
						playlistArray.songs.push(song);
						durationToAdd += song.duration;
					}
					playlistArray.duration += durationToAdd;
				} catch (error) {
					bot.logger.error(
						`Error saving current queue to paylist ${error}`
					);
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_ERROR_SAVING_TO_PLAYLIST"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				await playlistArray.save();
				embed = new EmbedBuilder()
					.setColor(bot.config.colorTrue)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_SAVED_CURRENT_QUEUE_AS_PLAYLIST",
							{
								SIZE: pushedAmount,
								PLAYLISTNAME: playlistArray.name,
							}
						)
					);
				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			case "create": // playlistName required
				// CHECK FOR USER PREMIUM
				if (!userSettings.premium) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REQUIRES_PREMIUM"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// CHECK IF USER HAS REACHED MAX AMOUNT OF PLAYLISTS
				playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
				}).exec();

				if (playlistArray.length >= 5) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REACHED_MAX_AMMOUNT"
							)
						);
					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				let plsettings = {
					name: playlistName,
					creator: interaction.user.id,
				};
				await bot.createPlaylist(bot, plsettings);
				embed = new EmbedBuilder()
					.setColor(bot.config.colorTrue)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_SUCCESS_CREATING_PLAYLIST",
							{
								PLAYLISTNAME: playlistName,
							}
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			case "delete": // playlistName required
				if (!userSettings.premium) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REQUIRES_PREMIUM"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				playlistArray = await PlaylistSchema.find({
					name: playlistName,
					creator: interaction.user.id,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// CHECK IF USER WANTS TO DELETE DEFAULTPLAYLIST
				if (playlistName == userSettings.defaultPlaylist) {
					let newSettings = {
						defaultPlaylist:
							bot.config.defaultUserSettings.defaultPlaylist,
					};
					await bot.updateUserSettings(
						interaction.user.id,
						newSettings
					);
				}
				let success = await bot.deletePlaylist(
					interaction.user.id,
					playlistName
				);

				if (!success) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_ERROR_DELETING_PLAYLIST"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				embed = new EmbedBuilder()
					.setColor(bot.config.colorTrue)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_SUCCESS_DELETING_PLAYLIST",
							{
								PLAYLISTNAME: playlistName,
							}
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			case "default": // playlistName required
				// CHECK FOR USER PREMIUM
				if (!userSettings.premium) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REQUIRES_PREMIUM"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				playlistArray = await PlaylistSchema.find({
					name: playlistName,
					creator: interaction.user.id,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				if (playlistArray) {
					let settingsToUpdate = {
						defaultPlaylist: playlistName,
					};
					await bot.updateUserSettings(
						interaction.user.id,
						settingsToUpdate
					);
				}
				embed = new EmbedBuilder()
					.setColor(bot.config.colorTrue)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_UPDATED_DEFAULT_PLAYLIST",
							{
								PLAYLISTNAME: playlistName,
							}
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			case "share": // playlistName required
				// CHECK FOR USER PREMIUM
				if (!userSettings.premium) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_REQUIRES_PREMIUM"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				playlistArray = await PlaylistSchema.find({
					name: playlistName,
					creator: interaction.user.id,
				}).exec();
				// CHECK IF ANY PLAYLISTS FOUND
				if (playlistArray.length <= 0) {
					// RETURN ERROR THAT IT FOUND NO PLAYLIST
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_NO_PLAYLIST_DESC"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_SHARE_PLAYLIST",
							{
								PLAYLISTNAME: playlistArray.name,
								ID: playlistArray._id,
							}
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
				break;
		}

		async function checkMusic(bot, interaction, settings, member, player) {
			// CHECK FOR DJ
			if (!bot.checkDJ(member, settings)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_NOT_A_DJ"
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// CHECK IF USER IS IN VC
			const { channel } = member.voice;
			if (!channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_NOT_VC"
						)
					);

				return await interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// CHECK IF USER IS IN *SAME* VC
			if (player && channel.id !== player.voiceChannel) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone:playlist:EMBED_NOT_SAME_VC"
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// CHECK FOR RESTRICTED VC
			if (!bot.checkVC(member, settings)) {
				let str = [];
				VCs.map((v) => {
					str.push(`<#${v}>`);
				});

				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						`${bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_NOT_ALLOWED_TO_JOIN"
						)} ${str.join("\n")}`
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
		}
	}
};
