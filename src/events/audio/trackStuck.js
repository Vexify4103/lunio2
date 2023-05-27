const Event = require("../../structures/Event");
const { EmbedBuilder } = require("discord.js");
const {
	setTimeoutId,
	clearTimeoutByMessageId,
} = require("../../utils/functions/UtilFunctios/timeoutManager");

class TrackStuck extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track, payload) {
		bot.logger.log(
			`Track got stuck: ${track.author} - ${track.title} in guild: ${player.guild}`
		);
		let title = bot.translate(settings.Language, "misc:ERROR_TITLE");
		let embed = new EmbedBuilder()
			.setColor(bot.config.colorWrong)
			.setTitle(title)
			.setDescription(`${track.title}`);

		let channel = await bot.channels.fetch(player.textChannel);

		player.stop();

		if (channel)
			channel
				.send({
					embeds: [embed],
				})
				.then((m) => {
					setTimeoutId(
						m.id,
						setTimeout(() => m.delete(), bot.config.DeleteTimeout)
					);
				})
				.catch((err) => {
					console.error(err);
				});
	}
}

module.exports = TrackStuck;
