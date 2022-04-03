const {
	MessageEmbed
} = require('discord.js');
const Event = require('../../structures/Event');

class QueueEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, { identifier: videoID, requester }) {
		// console.log(player.identifier)
		// console.log(requester)
		let settings = await bot.getGuildData(bot, player.guild);
		let channel = await bot.channels.fetch(player.textChannel);
		let customch;

		if (settings.CustomChannel) {	
			try {
				customch = await bot.channels.fetch(settings.mChannelID);
				await bot.musicoff(bot, settings);
			} catch (error) {
				bot.logger.error(`Error on queueEnd ${error}`)
			}
		}
		if (player.autoplay) {
			console.log(videoID);
			console.log(requester);
			let res;
			try {
				res = await player.search(`https://www.youtube.com/watch?v=${videoID}&list=RD${videoID}`, requester);
				if (res.loadType === 'LOAD_FAILED') {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}
			} catch (error) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'misc:AUTOPLAY_ERROR'))


				if (settings.CustomChannel) {
					return customch.send({
						embeds: [embed]
					})
				} else {
					return channel.send({
						embeds: [embed]
					})
				}
			}
			switch (res.loadType) {
				case "NO_MATCHES":
					const nores = new MessageEmbed()
						.setColor(bot.config.colorWrong)
						.setDescription(bot.translate(settings.Language, 'Everyone/play:NO_MATCHES'))
						
					if (settings.CustomChannel) {
						return customch.send({
							embeds: [nores]
						})
					} else {
						return channel.send({
							embeds: [nores]
						})
					}
				case "PLAYLIST_LOADED":
					player.queue.add(res.tracks);
					let PLAYLIST_LOADED = new MessageEmbed()
						.setColor(bot.getColor(bot, player.guild))
						.setDescription(`${res.tracks.length} tracks queued from: ${bot.codeBlock(res.playlist.name)}.`)
						.setDescription(bot.translate(settings.Language, 'Everyone/play:PL_LOADED_DESC_2', {
							size: res.tracks.length,
							playlistname: res.playlist.name
						}))

					await bot.musicembed(bot, player, settings);
					if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
					
					if (settings.CustomChannel) {
						return customch.send({
							embeds: [PLAYLIST_LOADED]
						})
					} else {
						return channel.send({
							embeds: [PLAYLIST_LOADED]
						})
					}
				case "TRACK_LOADED":
					player.queue.add(track)
					await bot.musicembed(bot, player, settings);
					if (!player.playing && !player.paused && !player.queue.size) player.play();
					break;
				case "SEARCH_RESULT":
					player.queue.add(track)
					await bot.musicembed(bot, player, settings);
					if (!player.playing && !player.paused && !player.queue.size) player.play();
					break;
			}
		} else {
			if (settings.CustomChannel) await bot.musicoff(bot, settings);
			player.timeout = setTimeout(() => {
				// Don't leave channel if 24/7 mode is active
				if (player.twentyFourSeven) return clearTimeout(player.timeout);

				let embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'misc:INACTIVE_TIMEOUT', {
						URL: bot.config.premiumLink
					}))

				if (settings.CustomChannel) {
					customch.send({
						embeds: [embed]
					})
				} else {
					channel.send({
						embeds: [embed]
					})
				}
				player.destroy();
			}, 1000 * 5); //1000 * 60 * 15
		}
	}
}

module.exports = QueueEnd;