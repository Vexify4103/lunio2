const { EmbedBuilder } = require("discord.js");
const musicembed = require("./musicembed");

module.exports = async (
	bot,
	msg,
	search,
	{
		mChannelID,
		mChannelEmbedID,
		DefaultVol,
		SongUserLimit,
		SongTimeLimitMS,
		Playlists,
		Language,
		Requester,
	},
	member
) => {
	bot.logger.log("Searching for track/s using search function");
	let player;
	let embed;
	let flags = {
		shuffle: false,
		reverse: false,
		next: false,
	};
	// Check for flags in the search term
	const flagsRegex = /(-[s|r|n])+$/; // Regex to match flags at the end of the search term
	const matches = search.match(flagsRegex);
	if (matches) {
		const matchedFlags = matches[0];
		flags.shuffle = matchedFlags.includes("s");
		flags.reverse = matchedFlags.includes("r");
		flags.next = matchedFlags.includes("n");
		search = search.replace(matchedFlags, "").trim();
	}
	try {
		player = bot.manager.create({
			guild: msg.guild.id,
			voiceChannel: msg.member.voice.channel.id,
			textChannel: msg.channel.id,
			selfDeafen: true,
			volume: DefaultVol,
		});
	} catch (err) {
		bot.logger.error(`Error searching for songs ${err}`);
	}
	if (search.length === 0) {
		// Check if a file was uploaded to play instead
		const fileTypes = ["mp3", "mp4", "wav", "m4a", "webm", "aac", "ogg"];
		if (msg.attachments.size > 0) {
			const url = msg.attachments.first().url;
			for (const fileType of fileTypes) {
				if (url.endsWith(fileType)) {
					searchpush(url);
				}
			}
		}
	}
	if (!player) return;
	if (player.state !== "CONNECTED") {
		player.connect();
	}

	const channel = await bot.channels.fetch(mChannelID);
	const message = await channel.messages.fetch(mChannelEmbedID);

	bot.manager.search(search, member.user).then(async (res) => {
		res = await bot.replaceTitle(bot, res);
		await bot.delay(bot, 100);
		const color = await bot.getColor(bot, msg.guild.id);
		if (SongUserLimit > 0 && bot.checkDJ(member, { SongUserLimit })) {
			res.tracks = res.tracks.slice(0, SongUserLimit);
		}
		if (SongTimeLimitMS > 0 && bot.checkDJ(member, { SongTimeLimitMS })) {
			res.tracks = res.tracks.filter(
				(song) => song.duration <= SongTimeLimitMS
			);
		}

		const track = res.tracks[0];

		switch (res.loadType) {
			case "NO_MATCHES":
				embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(Language, "Everyone/play:NO_MATCHES")
					);

				return message.reply({
					embeds: [embed],
				});
			case "TRACK_LOADED":
			case "SEARCH_RESULT":
				bot.logger.log(
					`${msg.guild.id} ${res.loadType.toLowerCase()}: ${
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
					player.play();

				break;
			case "PLAYLIST_LOADED":
				if (search.includes("&list=RD")) {
					bot.logger.log(
						`${msg.guild.id} track_loaded: ${
							track.author
						} - ${track.title}`
					);
					if (flags.next) {
						player.queue.unshift(track);
					} else {
						player.queue.add(track);
					}
					if (flags.shuffle) player.queue.shuffle();

					embed = new EmbedBuilder().setColor(color).setDescription(
						bot.translate(
							Language,
							"Everyone/play:PL_LOADED_DESC_1",
							{
								PLAYLISTNAME: `${bot.codeBlock(
									res.playlist.name
								)}`,
							}
						)
					);

					if (!player.playing && !player.paused && !player.queue.size)
						player.play();
				} else {
					if (Playlists) {
						bot.logger.log(
							`${msg.guild.id} ${res.loadType.toLowerCase()}: ${
								res.playlist.name
							}`
						);
						if (flags.shuffle) shuffleArray(res.tracks);
						if (flags.reverse) res.tracks.reverse();
						if (flags.next) player.queue.unshift(...res.tracks);

						embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(
								bot.translate(
									Language,
									"Everyone/play:PL_LOADED_DESC_2",
									{
										SIZE: res.tracks.length,
										PLAYLISTNAME: `${bot.codeBlock(
											res.playlist.name
										)}`,
									}
								)
							);

						player.queue.add(res.tracks);
						if (
							!player.playing &&
							!player.paused &&
							player.queue.totalSize === res.tracks.length
						)
							player.play();
					} else {
						embed = new EmbedBuilder()
							.setColor(bot.config.colorOrange)
							.setDescription(
								bot.translate(
									Language,
									"Everyone/play:PL_NOT_ALLOWED"
								)
							);
					}
				}
				return message.reply({
					embeds: [embed],
				});
		}
		return await musicembed(bot, player, {
			mChannelID,
			mChannelEmbedID,
			Requester,
			Language,
		});
	});
	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
};
