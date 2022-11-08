// Dependencies
const Event = require('../../structures/Event');
const {
	EmbedBuilder,
	Channel,
	Permissions,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require("discord.js");
const {
	PlaylistSchema
} = require("../../database/models");
const {
	TrackUtils
} = require('erela.js');

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
		let settings = await bot.getGuildData(bot, guild.id)
		if (Object.keys(settings).length == 0) return button.deferUpdate();;
		if (!settings.CustomChannel) return button.deferUpdate();;

		// GETTING USER SETTINGS
		let userSettings = await bot.getUserData(bot, user.id)
		if (Object.keys(userSettings).length == 0) return button.deferUpdate();;

		// FETCHING MEMBER
		const member = await guild.members.fetch(user.id);

		// IF THE USER IS IN NO VOICE CHANNEL RETURN
		if (!member.voice.channel) return button.deferUpdate();;

		// GET PLAYER
		const player = bot.manager.players.get(guild.id);

		// CHECK IF USER IS BANNED
		if (userSettings.guilds.includes(guild.id)) return button.deferUpdate();;

		// CHECK FOR USER DJ
		if (settings.MusicDJ && button.customId === 'play' || 'pause' || 'skip' || 'clear' || 'loop' || 'loopqueue' || 'loopsong' || 'shuffle' || 'atp' || 'rfp') {
			if (!bot.checkDJ(member, settings)) return;
		}
		// RUN AFTER CHECKED USER FOR EVERYTHING
		if (!player) return button.deferUpdate();;

		const message = button.message;
		let exist;
		let plsettings;
		switch (button.customId) {
			case "play":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				player.pause(false);
				await bot.musicembed(bot, player, settings);

				break;
			case "pause":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				player.pause(true);
				await bot.musicembed(bot, player, settings);

				break;
			case "skip":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				player.stop();
				await bot.musicembed(bot, player, settings);

				break;
			case "clear":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				player.queue.clear();
				player.stop();

				break;
			case "loop":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping the queue activated.`)

				player.setQueueRepeat(true);
				await bot.musicembed(bot, player, settings);
				message.reply({
					embeds: [embed]
				})

				break;
			case "loopqueue":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping the current song enabled.`)

				player.setTrackRepeat(true);
				await bot.musicembed(bot, player, settings);
				message.reply({
					embeds: [embed]
				})

				break;
			case "loopsong":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(`Looping disabled.`)

				player.setTrackRepeat(false);
				await bot.musicembed(bot, player, settings);
				message.reply({
					embeds: [embed]
				})

				break;
			case "shuffle":
				button.deferUpdate();
				if (!player.queue.current && player.queue.size === 0) return;
				player.queue.shuffle();
				await bot.musicembed(bot, player, settings);

				break;
			case "atp":
				button.deferUpdate();
				// REQUIRE VOTE FOR THIS!
				//////////////////////////

				// IF BOT IS PLAYING IN OTHER CHANNEL THAN USER RETURN
				if (player?.playing && guild?.me?.voice?.channel?.id !== member.voice.channel.id) return;
				// IF BOT IS IN CHANNEL AND IS NOT PLAYING CREATE PLAYER AND RUN PLAYLIST
				if ((guild.members.me.voice.channel && !player) || (player && !player.playing) || (!player && !guild.members.me.voice.channel)) {
					if (player?.voiceChannel !== member.voice.channel.id) return;
					PlaylistSchema.findOne({
						name: userSettings.defaultPlaylist,
						creator: user.id
					}, async (err, p) => {
						if (err) return;
						if (p) {
							let player;
							try {
								player = bot.manager.create({
									guild: guild.id,
									voiceChannel: member.voice.channel.id,
									textChannel: channel.id,
									selfDeafen: true,
									volume: settings.DefaultVol
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

								embed = new EmbedBuilder()
									.setColor(await bot.getColor(bot, guild.id))
									.setDescription(`${p.songs.length} tracks queued from ${bot.codeBlock(p.name)}.`)

								return message.reply({
									embeds: [embed],
								})
							} catch (error) {
								bot.logger.error(error)
							}
						} else {
							plsettings = {
								name: "Songs",
								creator: user.id
							}
							await bot.createPlaylist(bot, plsettings);
						}
					})
					return;
				}
				// IF BOT IS PLAYING ADD TO DEFAULT PLAYLIST -> CREATE ONE IF NECCESSARY
				if (player?.playing) {
					//TRY LOADING PLAYLIST
					exist = await bot.existPlaylist(user.id, userSettings.defaultPlaylist);
	
					if (!exist) {
						plsettings = {
							name: "Songs",
							creator: user.id
						}
						await bot.createPlaylist(bot, plsettings);
						await bot.delay(bot, 1500);
					}
	
					PlaylistSchema.findOne({
						name: userSettings.defaultPlaylist,
						creator: user.id
					}, async (err, p) => {
						if (err) {
							embed = new EmbedBuilder()
								.setColor(bot.config.colorWrong)
								.setDescription(`Could not find any playlists.`)
	
							return message.reply({
								embeds: [embed],
							});
						}
						if (p) {
							if ((p.songs.length >= 15 && !userSettings.premium) || (p.songs.length >= 100 && userSettings.premium)) {
								embed = new EmbedBuilder()
									.setColor(bot.config.colorOrange)
									.setDescription(`You reached the maximum amount of tracks in your playlist.`)
	
								return message.reply({
									embeds: [embed],
								})
							}
							let current = {
								requester: user,
								title: player.queue.current.title,
								author: player.queue.current.author,
								duration: player.queue.current.duration
							}
							p.songs.push(current)
							p.duration = p.duration + player.queue.current.duration;
							embed = new EmbedBuilder()
								.setColor(bot.config.colorTrue)
								.setDescription(`Successfully added track ${bot.codeBlock(player.queue.current.author + " - " + player.queue.current.title)} to the playlist ${bot.codeBlock(p.name)}.`)
	
							message.reply({
								embeds: [embed],
							})
							return await p.save();
						} else {
							embed = new EmbedBuilder()
								.setColor(bot.config.colorWrong)
								.setDescription(`Could not find any playlists.`)
	
							return message.reply({
								embeds: [embed],
							});
						}
					})
				}
				break;
			case "rfp":
				button.deferUpdate();
				// CHECK IF VOTE
				//////////////////////////////////////////
				// IF NO PLAYER RETURN
				if (!player.queue.current && player.queue.length === 0) return;

				// IF NOT SAME VC RETURN
				if (player?.voiceChannel !== member.voice.channel.id) return;

				// IF PLAYER.QUEUE.CURRENT RETURN
				if (!player.queue.current) return;

				// TRY FINDING SONG BY SONG TITLE
				exist = await bot.existPlaylist(user.id, userSettings.defaultPlaylist);
				if (!exist) return;

				PlaylistSchema.findOne({
					name: userSettings.defaultPlaylist,
					creator: user.id
				}, async (err, p) => {
					if (err) {
						embed = new EmbedBuilder()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(`Error finding your playlist.`)
                              return message.reply({
                                   embeds: [embed],
                              });
					}
					if (p) {
						// const songIndex = searchAndDestroy(player.queue.current.title, player.queue.current.author, p)
						// console.log(`SongIndex: ${songIndex}`)
						let found = 0;
						for (let i = 0; i < p.songs.length; i++) {
							if (p.songs[i].title == player.queue.current.title && p.songs[i].author == player.queue.current.author) {
								found = i;
								break;
							}
						}
						try {
                                   p.songs.splice(found, 1);

                                   embed = new EmbedBuilder()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(`Successfully removed song at position ${bot.codeBlock(found + 1)}.`)

                                   message.reply({
                                        embeds: [embed],
                                   })
                                   return await p.save();
                              } catch (error) {
                                   bot.logger.error(error)
                              }
					} else {
						embed = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(`Could not find any playlists.`)

						return message.reply({
							embeds: [embed],
						});
					}
				})
				break;
			default:
				break;
		}
		return;
	}
};