// Dependencies
const { logger } = require("./utils");

(async () => {
	// This file is for sharding
	const { ShardingManager } = require("discord.js");

	// Create sharding manager
	const manager = new ShardingManager("./src/bot.js", {
		// Sharding options
		totalShards: "auto",
		token: require("./config.js").token,
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
