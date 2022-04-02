const Event = require('../../structures/Event');

class NodeConnect extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}
	async run(bot, node) {
		bot.logger.ready(`Lavalink node: ${node.options.identifier} has connected.`);
	}
}

module.exports = NodeConnect;