const Event = require("../../structures/Event");

class PlayerMove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, oldChannel, newChannel) {
		if (oldChannel === newChannel) return;
		const settings = await bot.getGuildData(bot, player.guild);

		if (!newChannel) {
			return player.destroy();
		} else {
			player.setVoiceChannel(newChannel);
			if (player.state !== "CONNECTED") player.connect();

			if (player.paused === true) {
				setTimeout(() => {
					player.pause(true);
					setTimeout(() => {
						player.pause(false);
					}, bot.ws.ping);
				}, bot.ws.ping);
			} else {
				return;
			}
		}
	}
}

module.exports = PlayerMove;
