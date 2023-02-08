const { EmbedBuilder } = require("discord.js");
const musicembed = require("./musicembed");

module.exports = async (bot, msg, search, settings, member) => {
	let player;
	let embed;
	try {
		player = bot.manager.create({
			guild: msg.guild.id,
			voiceChannel: msg.member.voice.channel.id,
			textChannel: msg.channel.id,
			selfDeafen: true,
			volume: settings.DefaultVol,
		});
	} catch (err) {
		bot.logger.error(`Error searching for songs ${err}`);
	}
	if (search.length == 0) {
		// Check if a file was uploaded to play instead
		const fileTypes = ["mp3", "mp4", "wav", "m4a", "webm", "aac", "ogg"];
		if (msg.attachments.size > 0) {
			const url = msg.attachments.first().url;
			for (let i = 0; i < fileTypes.length; i++) {
				if (url.endsWith(fileTypes[i])) {
					searchpush(url);
				}
			}
		}
	}
	if (!player) return;
	if (player.state !== "CONNECTED") {
		player.connect();
	}

	const channel = await bot.channels.fetch(settings.mChannelID);
	const message = await channel.messages.fetch(settings.mChannelEmbedID);


	bot.manager.search(search, member.user).then(async (res) => {
		res = await bot.replaceTitle(bot, res);
		await bot.delay(bot, 100);
		let color = await bot.getColor(bot, msg.guild.id);
		if (settings.SongUserLimit > 0 && bot.checkDJ(member, settings)) {
			res.tracks = res.tracks.slice(0, settings.SongUserLimit);
		}
		if (settings.SongTimeLimitMS > 0 && bot.checkDJ(member, settings)) {
			res.tracks = res.tracks.filter(
				(song) => song.duration <= settings.SongTimeLimitMS
			);
		}

		const track = res.tracks[0];
		//console.log(track)
		//console.log(track) track && player.queue[0] = {track:, title:, identifier:, author:, duration:, uri:, requester:, {}}
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

				return message.reply({
					embeds: [embed],
				});
			case "TRACK_LOADED":
				bot.logger.log(`Track Loaded: ${track.title}`);
				player.queue.add(track);

				if (!player.playing && !player.paused && !player.queue.size)
					player.play();

				return await musicembed(bot, player, settings);
			case "SEARCH_RESULT":
				bot.logger.log(`Found Track: ${track.title}`);
				player.queue.add(track);

				if (!player.playing && !player.paused && !player.queue.size)
					player.play();

				return await musicembed(bot, player, settings);
			case "PLAYLIST_LOADED":
				var PLAYLIST_LOADED;
				if (search.includes("&list=RD")) {
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

					player.queue.add(res.tracks[0]);

					if (!player.playing && !player.paused && !player.queue.size)
						player.play();
					await musicembed(bot, player, settings);
				} else {
					if (settings.Playlists) {
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

						player.queue.add(res.tracks);
						if (
							!player.playing &&
							!player.paused &&
							player.queue.totalSize === res.tracks.length
						)
							player.play();
						await musicembed(bot, player, settings);
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
				}
				return message.reply({
					embeds: [PLAYLIST_LOADED],
				});
		}
	});
};
