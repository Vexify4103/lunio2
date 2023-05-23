// Dependencies
const Event = require("../../structures/Event");

module.exports = class Raw extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, data) {
		// Used for the music plugin
		setTimeout(() => {
			bot.manager?.updateVoiceState(data);
		}, bot.ws.ping * 2);
		//bot.manager?.updateVoiceState(data);
	}
};
