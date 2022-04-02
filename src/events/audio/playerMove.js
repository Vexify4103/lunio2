const Event = require('../../structures/Event');

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
			if (!settings.CustomChannel) {
				return player.destroy();
			} else {
				await bot.musicoff(bot, settings);
				return player.destroy();
			}
		} else {
			//console.log(player)
			player.setVoiceChannel(newChannel);
			if (player.state !== "CONNECTED") player.connect();

			if (player.paused === true) {
				setTimeout(() => {
					player.pause(true);
					setTimeout(() => {
						player.pause(false);
					}, bot.ws.ping)
				}, bot.ws.ping);
			} else {
				return;
			}
		}
	}
}

module.exports = PlayerMove;