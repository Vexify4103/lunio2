const { EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");
const chalk = require("chalk");
const moment = require("moment");

class TrackStart extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		if (player.timeout != "null") clearTimeout(player.timeout);
		let settings = await bot.getGuildData(bot, player.guild);
		var title = track.title;

		//console.log(player)
		const timestamp = `[${moment().format("HH:mm:ss")}]:`;
		const content = `${player.guild} started track: ${title}`;
		console.log(`${timestamp} ${chalk.bgMagenta("PLAYING")} ${content}`);
		if (settings.CustomChannel) {
			if (settings.mChannelUpdateInProgress) {
				await bot.delay(bot, 1500);
				settings = await bot.getGuildData(bot, player.guild);
			} 
			return await bot.musicembed(bot, player, settings);
		}
		track = await bot.replaceTitle(bot, track);
		if (settings.Announce) {
			let description;
			if (settings.Requester) {
				description = `${title} ~ <@${track.requester.id}>`;
			} else {
				description = `${title}`;
			}
			let title2 = bot.translate(settings.Language, "misc:NOW_PLAYING");
			let embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, player.guild))
				.setTitle(title2)
				.setDescription(description);

			let channel = await bot.channels.fetch(player.textChannel);

			if (settings.DelAnnounce) {
				if (channel)
					channel
						.send({
							embeds: [embed],
						})
						.then((m) => {
							setTimeout(
								() => m.delete(),
								track.duration < 6.048e8
									? track.duration
									: 60000
							);
						})
						.catch((err) => {
							bot.logger.error(err);
						});
			} else {
				if (channel)
					channel.send({
						embeds: [embed],
					});
			}
		}
		return;
	}
}

module.exports = TrackStart;
