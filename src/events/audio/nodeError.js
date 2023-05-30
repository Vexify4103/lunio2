const Event = require("../../structures/Event");
const path = require("path");
const fs = require("fs");

class NodeError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, node, error) {
		let embed;
		try {
			//loop on every guild
			bot.guilds.cache.forEach(async (guild) => {
				const player = bot.manager.players.get(guild.id);
				if (!player) return;
				if (player.node.options.identifier !== node.options.identifier)
					return;
				bot.logger.lavalinkError(
					`node: '${node.options.identifier}', has error: ${error}`
				);

				if (settings.CustomChannel) {
					try {
						let customch = await bot.channels.fetch(
							settings.mChannelID
						);

						embed = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(
								bot.translate(
									settings.Language,
									"misc:PLAYER_ERROR"
								)
							);

						customch.send({
							embeds: [embed],
						});
						// await bot.musicoff(bot, settings);
						return player.destroy();
					} catch (error) {
						bot.logger.error(`Error on nodeError ${error}`);
					}
				} else {
					let channel = await bot.channels.fetch(player.textChannel);

					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"misc:PLAYER_ERROR"
							)
						);

					channel.send({
						embeds: [embed],
					});
					return player.destroy();
				}

				// const nodes = retrieveNodesFromJson(player);

				// const textChannel = player.textChannel;
				// const voiceChannel = player.voiceChannel;
				// const volume = player.volume;
				// const newPlayer = {
				// 	bands: player.bands,
				// 	trackRepeat: player.trackRepeat,
				// 	queueRepeat: player.queueRepeat,
				// 	position: player.position,
				// 	playing: player.playing,
				// 	paused: player.paused,
				// 	autoplay: player.autoplay,
				// 	speed: player.speed,
				// 	previousTracks: player.previousTracks,
				// 	skipSong: player.skipSong,
				// 	nightcore: player.nightcore,
				// 	vaporwave: player.vaporwave,
				// 	demon: player.demon,
				// 	timeout: player.timeout,
				// 	timeout2: player.timeout2,
				// 	timeout3: player.timeout3,
				// };

				// //console.log(newPlayer.node)
				// const settings = await bot.getGuildData(bot, guild.id);

				// // implement new player and add the current song to the player, with time to seek, and then add the queue to the new player aswell, after destroying the faulty player on the faulty node

				// // Add current track to the new player
				// const currentTrack = player.queue.current;
				// if (currentTrack) {
				// 	newPlayer.queue = [currentTrack];
				// }

				// // Add the queue to the new player
				// if (player.queue.length > 0) {
				// 	newPlayer.queue = player.queue;
				// }

				// // Destroy the faulty player on the faulty node
				// player.destroy();

				// // Update the guild's player with the new player
				// const newPlayer2 = bot.manager.create({
				// 	guild: guild.id,
				// 	//node: nodes,
				// 	textChannel: textChannel,
				// 	voiceChannel: voiceChannel,
				// 	selfDeafen: true,
				// 	volume: volume,
				// 	...newPlayer,
				// });

				// //console.log(newPlayer2);

				// if (settings.CustomChannel)
				// 	await bot.musicembed(bot, player, settings);
			});
		} catch (error) {
			bot.logger.lavalinkError(`error on nodeError: ${error}`);
		}

		function retrieveNodesFromJson(player) {
			try {
				// Construct the absolute path to the JSON file
				const jsonPath = path.join(
					__dirname,
					"..",
					"..",
					"base",
					"AudioNodes",
					"LavalinkNodes.json"
				);
				// Read the JSON file
				const jsonData = fs.readFileSync(jsonPath, "utf-8");

				// Parse the JSON data
				const nodes = JSON.parse(jsonData);

				const filteredNodes = nodes.filter(
					(node) => node.host !== player.node.options.identifier
				);

				// Return the array of nodes
				return filteredNodes;
			} catch (error) {
				console.error("Error retrieving nodes from JSON file:", error);
				return [];
			}
		}
	}
}

module.exports = NodeError;
