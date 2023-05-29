const { EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");
const chalk = require("chalk");
const moment = require("moment");
const {
	setTimeoutId,
	clearTimeoutByMessageId,
} = require("../../utils/functions/UtilFunctios/timeoutManager");

class TrackStart extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		if (player.timeout != "null") clearTimeout(player.timeout);
		if (player.timeout2 != "null") clearTimeout(player.timeout2);
		if (player.timeout3 != "null") clearTimeout(player.timeout3);
		
		let settings = await bot.getGuildData(bot, player.guild);
		track.title = await bot.replaceTitle(bot, track);

		//console.log(player)
		const timestamp = `[${moment().format("HH:mm:ss")}]:`;
		const content = `${player.guild} started track: ${track.author} - ${track.title}`;
		console.log(`${timestamp} ${chalk.bgMagenta("PLAYING")} ${content}`);
		if (settings.CustomChannel) {
			if (settings.mChannelUpdateInProgress) {
				await bot.delay(bot, 1500);
				settings = await bot.getGuildData(bot, player.guild);
			}
			return await bot.musicembed(bot, player, settings);
		}
		if (settings.Announce) {
			let description;
			if (settings.Requester) {
				description = `${track.title} ~ <@${track.requester.id}>`;
			} else {
				description = `${track.title}`;
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
							setTimeoutId(
								m.id,
								setTimeout(
									() => m.delete(),
									track.duration < 6.048e8
										? track.duration
										: 60000
								)
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
