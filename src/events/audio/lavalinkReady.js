const Event = require("../../structures/Event");

class lavalinkReady extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}
	async run(bot, node, payload) {
		bot.logger.lavalink(`session: ${payload.sessionId} is ready`);
	}
}

module.exports = lavalinkReady;
