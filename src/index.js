// Dependencies
const { logger } = require("./utils");

require("dotenv").config();
(async () => {
	// This file is for sharding
	const { ShardingManager } = require("discord.js");

	// Create sharding manager
	const token = process.env.TOKEN;
	const manager = new ShardingManager("./src/bot.js", {
		// Sharding options
		totalShards: "auto",
		token: process.env.TOKEN,
		// token: require("./config.js").token,
	});

	// Spawn your shards
	logger.log("=-=-=-=-=-=-=- Loading shard(s) -=-=-=-=-=-=-=");
	try {
		await manager.spawn();
	} catch (err) {
		logger.error(`Error loading shards: ${err.message}`);
	}

	// Emitted when a shard is created
	manager.on("shardCreate", (shard) => {
		logger.log(`Shard ${shard.id} launched`);
	});
})();
