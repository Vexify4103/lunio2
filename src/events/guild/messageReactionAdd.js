// Dependencies
const {
	MessageEmbed
} = require("discord.js");
const {
	PlaylistSchema
} = require("../../database/models");
const Event = require('../../structures/Event');
const {
	TrackUtils
} = require('erela.js');

module.exports = class messageReactionAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, reaction, user) {
		if (reaction.message.partials) await reaction.message.fetch();
		if (reaction.partial) await reaction.fetch();
		if (user.bot) return;
		if (!reaction.message.guild) return;
		// ASSIGNING GUILD and CHANNEL TO NEW SIMPLER VARIABLES
		const guild = reaction.message.guild;
		const channel = reaction.message.channel

		// GETTING GUILD SETTINGS
		let settings = await bot.getGuildData(bot, guild.id)
		if (Object.keys(settings).length == 0) return;
		if (!settings.CustomChannel) return;

		// GETTING USER SETTINGS
		let userSettings = await bot.getUserData(bot, user.id)
		if (Object.keys(userSettings).length == 0) return;

		// FETCHING MEMBER
		const member = await guild.members.fetch(user.id);
		// const me = await guild.members.fetch(bot.user.id);

		// IF REACTION IS NOT ON THE EMBED RETURN
		if (reaction.message.id !== settings.mChannelEmbedID) return;

		// REMOVE REACTIONS NO MATTER WHAT
		reaction.users.remove(member).catch((err) => {
			console.error(err)
		})

		// IF THE USER IS IN NO VOICE CHANNEL RETURN
		if (!member.voice.channel) return;

		// GET PLAYER
		const player = bot.manager.players.get(guild.id);

		reaction.users.remove(member).catch((err) => {
			console.error(err)
		})
		// if (!player) return reaction.users.remove(member).catch((err) => {
		// 	console.error(err)
		// })

		// CHECK IF USER IS BANNED
		if (userSettings.guilds.includes(guild.id)) return;

		let exist;
		let plsettings;
		let embed;

		switch (reaction.emoji.name) {
			case "⏯️":
				if (!player) return;
				if (!player.queue.current && player.queue.size === 0) return;

				if (player.paused) {
					player.pause(false)
					return await bot.musicembed(bot, player, settings);
				}
				if (!player.paused) {
					player.pause(true)
					return await bot.musicembed(bot, player, settings);
				}
				break;
			case "⏹️":
				if (!player) return;
				if (!player.queue.current && player.queue.size === 0) return;

				player.queue.clear()
				return player.stop()
			case "⏭️":
				if (!player) return;
				if (!player.queue.current && player.queue.size === 0) return;

				return player.stop()
			case "🔄":
				if (!player) return;
				if (!player.queue.current && player.queue.size === 0) return;

				if (!player.trackRepeat && !player.queueRepeat) {

					embed = new MessageEmbed()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(`Looping the queue activated.`)

					player.setQueueRepeat(true)

					await bot.musicembed(bot, player, settings);

					return channel.send({
						embeds: [embed]
					})

				} else if (player.queueRepeat && !player.trackRepeat) {

					embed = new MessageEmbed()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(`Looping the current song enabled.`)

					player.setTrackRepeat(true)

					await bot.musicembed(bot, player, settings);

					return channel.send({
						embeds: [embed]
					})

				} else if (player.trackRepeat === true && player.queueRepeat === false) {

					embed = new MessageEmbed()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(`Looping disabled.`)

					player.setTrackRepeat(false)

					await bot.musicembed(bot, player, settings);

					return channel.send({
						embeds: [embed]
					})
				}
				return;
			case "🔀":
				if (!player) return;
				if (!player.queue.current && player.queue.size === 0) return;

				player.queue.shuffle()

				return await bot.musicembed(bot, player, settings)
			case "⭐":
				// REQUIRE VOTE FOR THIS!
				//////////////////////////

				// IF BOT IS PLAYING IN OTHER CHANNEL THAN USER RETURN
				if (player?.playing && guild?.me?.voice?.channel?.id !== member.voice.channel.id) return;
				// IF BOT IS IN CHANNEL AND IS NOT PLAYING CREATE PLAYER AND RUN PLAYLIST
				if ((guild.me.voice.channel && !player) || (player && !player.playing) || (!player && !guild.me.voice.channel)) {
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

								embed = new MessageEmbed()
									.setColor(await bot.getColor(bot, guild.id))
									.setDescription(`${p.songs.length} tracks queued from ${bot.codeBlock(p.name)}.`)

								return channel.send({
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
							embed = new MessageEmbed()
								.setColor(bot.config.colorWrong)
								.setDescription(`Could not find any playlists.`)
	
							return channel.send({
								embeds: [embed],
							});
						}
						if (p) {
							if ((p.songs.length >= 15 && !userSettings.premium) || (p.songs.length >= 100 && userSettings.premium)) {
								embed = new MessageEmbed()
									.setColor(bot.config.colorOrange)
									.setDescription(`You reached the maximum amount of tracks in your playlist.`)
	
								return channel.send.reply({
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
							embed = new MessageEmbed()
								.setColor(bot.config.colorTrue)
								.setDescription(`Successfully added track ${bot.codeBlock(player.queue.current.author + " - " + player.queue.current.title)} to the playlist ${bot.codeBlock(p.name)}.`)
	
							channel.send({
								embeds: [embed],
							})
							return await p.save();
						} else {
							embed = new MessageEmbed()
								.setColor(bot.config.colorWrong)
								.setDescription(`Could not find any playlists.`)
	
							return channel.send({
								embeds: [embed],
							});
						}
					})
				}
				return;
			case "❌":
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
						embed = new MessageEmbed()
                                   .setColor(bot.config.colorWrong)
                                   .setDescription(`Error finding your playlist.`)
                              return channel.send({
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

                                   embed = new MessageEmbed()
                                        .setColor(bot.config.colorTrue)
                                        .setDescription(`Successfully removed song at position ${bot.codeBlock(found + 1)}.`)

                                   channel.send({
                                        embeds: [embed],
                                   })
                                   return await p.save();
                              } catch (error) {
                                   bot.logger.error(error)
                              }
					} else {
						embed = new MessageEmbed()
							.setColor(bot.config.colorWrong)
							.setDescription(`Could not find any playlists.`)

						return channel.send({
							embeds: [embed],
						});
					}
				})
				return;
		}
		function searchAndDestroy(title, author, playlist) {
			let found = 0;
			for (let i = 0; i < playlist.length; i++) {
				if (playlist.songs[i].title == title && playlist.songs[i].author == author) {
					found = i;
					return found;
				}
			}
		}
	}
};