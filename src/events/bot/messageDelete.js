const Event = require("../../structures/Event");
const {
	setTimeoutId,
	clearTimeoutByMessageId,
} = require("../../utils/functions/UtilFunctios/timeoutManager");

module.exports = class Message extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, msg) {
		if (msg.author == null) return;
		if (msg.author.id !== bot.user.id) return;
		try {
			clearTimeoutByMessageId(msg.id);
		} catch (error) {
			bot.logger.error(`Error deleting a timeout for message: ${msg.id}`);
			console.log(error);
		}
		return;
	}
};
