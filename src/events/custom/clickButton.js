// Dependencies
const Event = require("../../structures/Event");
const {
	EmbedBuilder,
	Channel,
	Permissions,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const { PlaylistSchema } = require("../../database/models");
const { TrackUtils } = require("erela.js");

module.exports = class clickButton extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, button) {
		//console.log(button)
		const guild = await bot.guilds.fetch(button.guildId);
		const user = button.user;
		let embed;
		// GETTING GUILD SETTINGS
		let settings = await bot.getGuildData(bot, guild.id);
		if (Object.keys(settings).length == 0) return button.deferUpdate();
		if (!settings.CustomChannel) return button.deferUpdate();
		// GETTING USER SETTINGS
		let userSettings = await bot.getUserData(bot, user.id);
		if (Object.keys(userSettings).length == 0) return button.deferUpdate();
		// FETCHING MEMBER
		const member = await guild.members.fetch(user.id);
		// GET PLAYER
		let player = bot.manager?.players?.get(guild.id);
		// IF THE USER IS IN NO VOICE CHANNEL RETURN
		if (!member.voice.channel) return button.deferUpdate();
		// IF USER IS NOT IN SAME CHANNEL RETURN
		if (player && member.voice.channel.id !== player?.voiceChannel)
			return button.deferUpdate();
		// CHECK IF USER IS BANNED
		if (userSettings.guilds.includes(guild.id)) return button.deferUpdate();
		// CHECK FOR USER DJ
		if (
			settings.MusicDJ &&
			(button.customId === "play" ||
				"pause" ||
				"skip" ||
				"clear" ||
				"loop" ||
				"loopqueue" ||
				"loopsong" ||
				"shuffle" ||
				"atp" ||
				"rfp")
		) {
			if (!bot.checkDJ(member, settings)) return;
		}

		const message = button.message;
		let exist;
		let playlistArray;
		let defaultSettings = {
			name: bot.config.defaultUserSettings.defaultPlaylist,
			creator: user.id,
		};
		switch (button.customId) {
			case "play":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				player.pause(false);
				return await bot.musicembed(bot, player, settings);
			case "pause":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				player.pause(true);
				return await bot.musicembed(bot, player, settings);
			case "skip":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				player.stop();
				return await bot.musicembed(bot, player, settings);
			case "clear":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (
					!player ||
					(!player.queue.current && player.queue.size === 0)
				)
					return;
				player.queue.clear();
				player.stop();
				return await bot.musicoff(bot, settings);
			case "loop":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping the queue activated.`);

				player.setQueueRepeat(true);
				await bot.musicembed(bot, player, settings);
				return message.reply({
					embeds: [embed],
				});
			case "loopqueue":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping the current song enabled.`);

				player.setTrackRepeat(true);
				await bot.musicembed(bot, player, settings);
				return message.reply({
					embeds: [embed],
				});
			case "loopsong":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping disabled.`);

				player.setTrackRepeat(false);
				await bot.musicembed(bot, player, settings);
				return message.reply({
					embeds: [embed],
				});
			case "shuffle":
				button.deferUpdate();
				// RUN AFTER CHECKED USER FOR EVERYTHING
				if (!player) return await bot.musicoff(bot, settings);
				if (!player.queue.current && player.queue.size === 0) return;
				player.queue.shuffle();
				return await bot.musicembed(bot, player, settings);
			case "atp":
				button.deferUpdate();
				// FIND THE PLAYLIST
				playlistArray = await PlaylistSchema.find({
					name: userSettings.defaultPlaylist,
					creator: user.id,
				}).exec();
				// CHECK IF PLAYLIST EXISTS
				if (playlistArray.length <= 0)
					await bot.createPlaylist(bot, defaultSettings);
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];

				if (!player && settings.Playlists) {
					// 1. Check if there is no player and settings.Playlists is true
					if (!player && settings.Playlists) {
						// Check if playlist has any songs
						if (playlistArray.songs.length <= 0) {
							return;
						}
						// Try and create player
						try {
							player = bot.manager.create({
								guild: guild.id,
								voiceChannel: member.voice.channel.id,
								textChannel: button.channelId,
								selfDeafen: true,
								volume: settings.DefaultVol,
							});
							if (player.state !== "CONNECTED") {
								player.connect();
							}
						} catch (error) {
							bot.logger.error(
								`Failed to create player: ${error}`
							);
							return;
						}

						// Add all songs to queue
						let failedSongsArray = [];

						for (const song of playlistArray.songs) {
							try {
								const searchResult = await bot.manager.search(
									`${song.title} - ${song.author}`,
									user
								);

								switch (searchResult.loadType) {
									case "NO_MATCHES":
										failedSongsArray.push(song.title);
										break;

									case "TRACK_LOADED":
									case "SEARCH_RESULT":
									case "PLAYLIST_LOADED":
										const track = searchResult.tracks[0];
										bot.logger.log(
											`Track loaded: ${track.title}`
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
									default:
										break;
								}
							} catch (error) {
								bot.logger.error(
									`Failed to search and add song: ${error}`
								);
								failedSongsArray.push(song);
							}
						}
						await bot.delay(bot, 500);
						await bot.musicembed(bot, player, settings);

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
						return message.reply({
							embeds: [embed],
						});
					}
					return;
				} else if (player && settings.Playlists && !player.playing) {
					// 2. Check if there is currently a player, settings.Playlists is true but the bot is not playing anything
					// Add all songs to queue
					let failedSongsArray = [];

					for (const song of playlistArray.songs) {
						try {
							const searchResult = await bot.manager.search(
								`${song.title} - ${song.author}`,
								user
							);

							switch (searchResult.loadType) {
								case "NO_MATCHES":
									failedSongsArray.push(song.title);
									break;

								case "TRACK_LOADED":
								case "SEARCH_RESULT":
								case "PLAYLIST_LOADED":
									const track = searchResult.tracks[0];
									bot.logger.log(
										`Track loaded: ${track.title}`
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
								default:
									break;
							}
						} catch (error) {
							bot.logger.error(
								`Failed to search and add song: ${error}`
							);
							failedSongsArray.push(song);
						}
					}
					await bot.delay(bot, 1500);
					await bot.musicembed(bot, player, settings);

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
					return message.reply({
						embeds: [embed],
					});
				} else if (player && settings.Playlists && player.playing) {
					// 3. If the bot is playing something and there is a player
					// CHECK IF USER HAS ENOUGH SPACE IN PLAYLIST
					if (
						(playlistArray.songs.length >=
							bot.config.changeableSettings.maxSongsInPlaylist &&
							!userSettings.premium) ||
						(playlistArray.songs.length >=
							userSettings.maxSongsInPlaylist &&
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

						return message.reply({
							embeds: [embed],
						});
					}
					let current = player.queue.current;
					playlistArray.songs.push(current);
					playlistArray.duration += current.duration;
					await playlistArray.save();

					embed = new EmbedBuilder()
						.setColor(bot.config.colorTrue)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/playlist:EMBED_SAVED_CURRENT_QUEUE_AS_PLAYLIST",
								{
									SIZE: 1,
									PLAYLISTNAME: playlistArray.name,
								}
							)
						);
					return message.reply({
						embeds: [embed],
					});
				}
			case "rfp":
				button.deferUpdate();
				// CHECK IF VOTE
				// CHECK IF PLAYER EXISTS OR NOTHING IS CURRENTLY BEING PLAYED
				if (!player || !player.queue.current) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"slashCreate:BOT_NOT_PLAYING"
							)
						);

					return message.reply({
						embeds: [embed],
					});
				}
				// FIND THE PLAYLIST
				playlistArray = await PlaylistSchema.find({
					name: userSettings.defaultPlaylist,
					creator: user.id,
				}).exec();
				// CHECK IF PLAYLIST EXISTS
				if (playlistArray.length <= 0)
					await bot.createPlaylist(bot, defaultSettings);
				// GET INTO THE FIRST PLAYLIST THAT MATCHES
				playlistArray = playlistArray[0];
				// FILTER
				const currentSong = {
					track: player.queue.current.track,
					uri: player.queue.current.uri,
					title: player.queue.current.title,
					author: player.queue.current.author,
				};
				const songIndex = playlistArray.songs.findIndex((song) => {
					return (
						song.track === currentSong.track ||
						song.uri === currentSong.uri ||
						(song.author === currentSong.author &&
							song.title === currentSong.title)
					);
				});
				// GET THE POSITION OF THE SONG IN THE PLAYLIST
				if (songIndex !== -1) {
					const songToRemove = playlistArray.songs[songIndex];

					if (songToRemove && songToRemove.title) {
						embed = new EmbedBuilder()
							.setColor(bot.config.colorTrue)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/playlist:EMBED_REMOVED_TRACK_FROM_PLAYLIST",
									{
										SONGTITLE: songToRemove.title,
										SONGID: songIndex + 1,
									}
								)
							);
						playlistArray.duration -= songToRemove.duration;
						playlistArray.songs.splice(songIndex, 1);
						await playlistArray.save();

						return message.reply({
							embeds: [embed],
						});
					} else {
						return;
					}
				}
				break;
			default:
				break;
		}
		return undefined;
	}
};
