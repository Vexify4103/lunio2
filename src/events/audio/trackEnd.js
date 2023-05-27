const Event = require("../../structures/Event");
const chalk = require("chalk");
const moment = require("moment");

class TrackEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		const timestamp = `[${moment().format("HH:mm:ss")}]:`;
		const content = `${player.guild} finished track: ${track.author} ${track.title}`;
		console.log(`${timestamp} ${chalk.bgYellow("FINISHED")} ${content} `);
		player.addPreviousSong(track);
		player.removeSkip();
	}
}

module.exports = TrackEnd;
