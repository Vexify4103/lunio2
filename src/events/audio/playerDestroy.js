const Event = require("../../structures/Event");

class PlayerDestroy extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player) {
		bot.logger.log(`Lavalink player destroyed in guild: ${player.guild}`);
		const settings = bot.getGuildData(bot, player.guild);

		if (settings.CustomChannel) {
			return await bot.musicoff(bot, settings);
		}
	}
}

module.exports = PlayerDestroy;
