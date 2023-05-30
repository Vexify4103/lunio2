const { Manager } = require("erela.js");
const Deezer = require("erela.js-deezer");
const Spotify = require("erela.js-spotify");
const Facebook = require("erela.js-facebook");
require("dotenv").config();
const config = require("../config");
require("../structures/Player");
const path = require("path");
const fs = require("fs");

/**
 * Audio manager
 * @extends {Manager}
 */
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes: config.lavalinkLocal
				? retrieveNodesFromConfig()
				: retrieveNodesFromJson(),
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

function retrieveNodesFromJson() {
	try {
		// Construct the absolute path to the JSON file
		const jsonPath = path.join(
			__dirname,
			"AudioNodes",
			"LavalinkNodes.json"
		);
		// Read the JSON file
		const jsonData = fs.readFileSync(jsonPath, "utf-8");

		// Parse the JSON data
		const nodes = JSON.parse(jsonData);

		// Return the array of nodes
		return nodes;
	} catch (error) {
		console.error("Error retrieving nodes from JSON file:", error);
		return [];
	}
}

function retrieveNodesFromConfig() {
	const stringValue = process.env.LAVALINKSECURE;
	const boolean = stringValue === "TRUE";
	return [
		{
			host: process.env.LAVALINKHOST,
			port: parseInt(process.env.LAVALINKPORT),
			password: process.env.LAVALINKPASSWORD,
			secure: boolean,
		},
	];
}

module.exports = AudioManager;
