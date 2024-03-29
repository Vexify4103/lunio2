// Dependencies
const { EmbedBuilder } = require("discord.js");
const Command = require("../../structures/Command.js");

module.exports = class Play extends Command {
	constructor(bot) {
		super(bot, {
			name: "play",
			dirname: __dirname,
			aliases: ["p"],
			description: "Plays a song or playlist.",
			helpPerms: "Everyone",
			usage: "play <song name/url> [flags]",
			cooldown: 3000,
			slash: true,
			music: true,
			reqvc: true,
			options: [
				{
					name: "track",
					description: "The link or title of the track.",
					type: 3,
					required: true,
					autocomplete: true,
				},
				{
					name: "flags",
					description: "Specify extra parameters.",
					type: 3,
					required: false,
					choices: [
						{
							name: "-n (next)",
							value: "n",
						},
						{
							name: "-s (shuffle)",
							value: "s",
						},
						{
							name: "-r (reverse)",
							value: "r",
						},
					],
				},
			],
		});
	}
	// Function for slash command
	async callback(bot, interaction, guild, args, settings) {
		let player;
		let embed;
		const member = await guild.members.fetch(interaction.user.id);
		const textchannel = await guild.channels.fetch(interaction.channelId);

		await interaction.deferReply({ ephemeral: true });
		const { channel } = member.voice;
		const search = interaction.options.getString("track");
		const flagsString = interaction.options.getString("flags");

		let flags = {
			shuffle: false,
			reverse: false,
			next: false,
		};
		switch (flagsString) {
			case "n":
				flags.next = true;
				break;
			case "s":
				flags.shuffle = true;
				break;
			case "r":
				flags.reverse = true;
				break;
			default:
				break;
		}

		let title;
		try {
			player = bot.manager.create({
				guild: guild.id,
				textChannel: textchannel.id,
				voiceChannel: channel.id,
				selfDeafen: true,
				volume: settings.DefaultVol,
			});
			if (player.state !== "CONNECTED") {
				player.connect();
			}
		} catch (error) {
			bot.logger.error(`Error creating player ${error}`);
			return;
		}

		let res = await bot.manager.search(search, member.user);
		res.tracks = await bot.replaceCredentials(bot, res);
		await bot.delay(bot, 500);
		const color = await bot.getColor(bot, guild.id);

		if (settings.SongUserLimit > 0 && bot.checkDJ(member, settings)) {
			res.tracks = res.tracks.slice(0, settings.SongUserLimit);
		}
		if (settings.SongTimeLimitMS > 0 && bot.checkDJ(member, settings)) {
			res.tracks = res.tracks.filter(
				(song) => song.duration <= settings.SongTimeLimitMS
			);
		}

		const track = res.tracks[0];

		if (!track || res.tracks.length === 0) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.translate(settings.Language, "Everyone/play:NO_MATCHES")
				);

			return setTimeout(() => {
				interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}, bot.ws.ping * 2);
		}

		switch (res.loadType) {
			case "NO_MATCHES":
				embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/play:NO_MATCHES"
						)
					);

				interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
				break;
			case "TRACK_LOADED":
			case "SEARCH_RESULT":
				bot.logger.log(
					`${guild.id} ${res.loadType.toLowerCase()}: ${
						track.author
					} - ${track.title}`
				);
				if (flags.next) {
					player.queue.unshift(track);
				} else {
					player.queue.add(track);
				}
				if (flags.shuffle) player.queue.shuffle();

				if (!player.playing && !player.paused && !player.queue.size)
					await player.play();

				if (!settings.CustomChannel) {
					if (player.queue.length !== 0) {
						title = bot.translate(
							settings.Language,
							"Everyone/play:LOADED_TITLE_1",
							{
								POS: player.queue.length,
							}
						);
					} else {
						title = bot.translate(
							settings.Language,
							"Everyone/play:LOADED_TITLE_2"
						);
					}
					embed = new EmbedBuilder()
						.setColor(color)
						.setTitle(title)
						.setDescription(`${track.author} - ${track.title}`);

					setTimeout(() => {
						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					}, bot.ws.ping * 2);
				} else {
					if (player.queue.length !== 0) {
						title = bot.translate(
							settings.Language,
							"Everyone/play:LOADED_TITLE_1",
							{
								POS: player.queue.length,
							}
						);
					} else {
						title = bot.translate(
							settings.Language,
							"Everyone/play:LOADED_TITLE_2"
						);
					}
					embed = new EmbedBuilder()
						.setColor(color)
						.setTitle(title)
						.setDescription(`${track.author} - ${track.title}`);

					setTimeout(() => {
						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					}, bot.ws.ping * 2);
					await bot.musicembed(bot, player, settings);
				}
				break;
			case "PLAYLIST_LOADED":
				//FLAGS
				let PLAYLIST_LOADED;
				if (search.includes("&list=RD")) {
					bot.logger.log(
						`${guild.id} track_loaded: ${track.author} - ${track.title}`
					);
					if (flags.next) {
						player.queue.unshift(track);
					} else {
						player.queue.add(track);
					}
					if (flags.shuffle) player.queue.shuffle();
					PLAYLIST_LOADED = new EmbedBuilder()
						.setColor(color)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/play:PL_LOADED_DESC_1",
								{
									PLAYLISTNAME: `${bot.codeBlock(
										res.playlist.name
									)}`,
								}
							)
						);

					if (!player.playing && !player.paused && !player.queue.size)
						await player.play();

					setTimeout(() => {
						interaction.editReply({
							embeds: [PLAYLIST_LOADED],
							ephemeral: true,
						});
					}, bot.ws.ping * 2);
				} else {
					if (settings.Playlists) {
						bot.logger.log(
							`${guild.id} ${res.loadType.toLowerCase()}: ${
								res.playlist.name
							}`
						);
						if (flags.shuffle) shuffleArray(res.tracks);
						if (flags.reverse) res.tracks.reverse();
						if (flags.next) { 
							player.queue.unshift(...res.tracks);
						} else {
							player.queue.add(res.tracks);
						}
						PLAYLIST_LOADED = new EmbedBuilder()
							.setColor(color)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/play:PL_LOADED_DESC_2",
									{
										SIZE: res.tracks.length,
										PLAYLISTNAME: `${bot.codeBlock(
											res.playlist.name
										)}`,
									}
								)
							);

						if (
							!player.playing &&
							!player.paused &&
							player.queue.totalSize === res.tracks.length
						)
							await player.play();
					} else {
						PLAYLIST_LOADED = new EmbedBuilder()
							.setColor(bot.config.colorOrange)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/play:PL_NOT_ALLOWED"
								)
							);
					}
					setTimeout(() => {
						interaction.editReply({
							embeds: [PLAYLIST_LOADED],
							ephemeral: true,
						});
					}, bot.ws.ping * 2);
				}
				if (settings.CustomChannel) {
					await bot.musicembed(bot, player, settings);
				}
				break;
		}

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
