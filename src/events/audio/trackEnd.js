const Event = require('../../structures/Event');

class TrackEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		player.addPreviousSong(track);
		player.removeSkip()
	}
}

module.exports = TrackEnd;