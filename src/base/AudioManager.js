const { Manager } = require("erela.js");
const Deezer = require("erela.js-deezer");
const Spotify = require("erela.js-spotify");
const Facebook = require("erela.js-facebook");
require("dotenv").config();
//const { lavalink: nodes, api_keys: { spotify } } = require("../config");
require("../structures/Player");

/**
 * Audio manager
 * @extends {Manager}
 */
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes: [{
				host: process.env.LAVALINKHOST,
				port: parseInt(process.env.LAVALINKPORT),
				password: process.env.LAVALINKPASSWORD,
			}],
			plugins: [
				new Deezer({ playlistLimit: 1, albumLimit: 1 }),
				new Facebook(),
				new Spotify({
					clientID: process.env.SPOTIFYID,
					clientSecret: process.env.SPOTIFYSECRET,
				}),
			],
			trackPartial: ["title", "author", "duration", "uri", "requester"],
			autoPlay: true,
			async send(id, payload) {
				const guild = await bot.guilds.fetch(id);
				if (guild) guild.shard.send(payload);
			},
		});
	}
}

module.exports = AudioManager;
