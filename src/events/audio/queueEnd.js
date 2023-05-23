const { EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");

class QueueEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, { identifier: videoID, requester }) {
		let settings = await bot.getGuildData(bot, player.guild);
		let channel = await bot.channels.fetch(player.textChannel);
		let channel2;
		let message;

		if (settings.CustomChannel) {
			channel2 = await bot.channels.fetch(settings.mChannelID);
			message = await channel2.messages.fetch(settings.mChannelEmbedID);
		}
		if (player.autoplay) {
			player.timeout = setTimeout(() => {
				// Don't leave channel if 24/7 mode is active
				if (player.twentyFourSeven) return clearTimeout(player.timeout);

				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"misc:INACTIVE_TIMEOUT",
							{
								URL: bot.config.premiumLink,
							}
						)
					);

				if (settings.CustomChannel) message.reply({ embeds: [embed] });
				else channel.send({ embeds: [embed] });
				player.destroy();
			}, bot.config.LeaveTimeout); //bot.config.LeaveTimeout
			
			player.playing = false;
			player.paused = false;
			let res;
			try {
				res = await player.search(
					`https://www.youtube.com/watch?v=${videoID}&list=RD${
						Math.floor(Math.random() * 24) + 1
					}`,
					requester
				);
				res = await bot.replaceTitle(bot, res);
				if (res.loadType === "LOAD_FAILED") {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}
			} catch (error) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(settings.Language, "misc:AUTOPLAY_ERROR")
					);

				if (settings.CustomChannel) message.reply({ embeds: [embed] });
				else
					return channel.send({
						embeds: [embed],
					});
			}
			const track = res.tracks[2];
			switch (res.loadType) {
				case "NO_MATCHES":
					const nores = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"Everyone/play:NO_MATCHES"
							)
						);

					if (settings.CustomChannel)
						message.reply({ embeds: [embed] });
					else
						channel.send({
							embeds: [nores],
						});
					break;
				case "PLAYLIST_LOADED":
					player.queue.add(track);
					if (!player.playing && !player.paused && !player.queue.size)
						await player.play();
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);
					break;
				case "TRACK_LOADED":
					player.queue.add(track);
					if (!player.playing && !player.paused && !player.queue.size)
						await player.play();
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);
					break;
				case "SEARCH_RESULT":
					player.queue.add(track);
					if (!player.playing && !player.paused && !player.queue.size)
						await player.play();
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);
					break;
			}
			return;
		} else {
			if (settings.CustomChannel) await bot.disablebuttons(bot, settings);
			player.timeout = setTimeout(() => {
				// Don't leave channel if 24/7 mode is active
				if (player.twentyFourSeven) return clearTimeout(player.timeout);

				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"misc:INACTIVE_TIMEOUT",
							{
								URL: bot.config.premiumLink,
							}
						)
					);

				if (settings.CustomChannel) message.reply({ embeds: [embed] });
				else
					channel.send({
						embeds: [embed],
					});
				player.destroy();
			}, bot.config.LeaveTimeout); //bot.config.LeaveTimeout
		}
	}
}

module.exports = QueueEnd;
