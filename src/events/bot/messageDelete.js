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
		if (!msg.author.bot || msg.author.id !== bot.user.id) return;
		if (msg.author.bot && msg.author.id === bot.user.id) {
			clearTimeoutByMessageId(msg.id);
		}
		return;
	}
};
