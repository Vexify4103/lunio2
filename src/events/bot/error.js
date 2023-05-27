// Dependencies
const Event = require("../../structures/Event");

module.exports = class Error extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, err) {
		console.log(err);
		//const error = new Error(err);
		const errorMessage = `${err.message} -- in file ${__filename} at line ${err.lineNumber}`;
		bot.logger.error(`Error occured: ${errorMessage}.`);
		// bot.logger.error("##############################");
		// bot.logger.error(`Full error: ${err}`);
	}
};
