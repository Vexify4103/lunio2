const Event = require("../../structures/Event");

class PlayerCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player) {
		if (bot.config.debug)
			bot.logger.log(
				`Lavalink player created in guild: ${player.guild}.`
			);
		var guild = await bot.guilds.fetch(player.guild);

		if (!guild.members.me.voice.serverDeaf) {
			setTimeout(() => {
				guild.members.me.voice.setDeaf(true).catch((err) => {
					bot.logger.error(
						`trying to selfDeaf: ${player.guild} | ${err}`
					);
				});
			}, bot.ws.ping * 2);
		}
	}
}

module.exports = PlayerCreate;
