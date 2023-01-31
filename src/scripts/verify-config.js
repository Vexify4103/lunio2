// Dependencies
const { logger } = require("../utils"),
	chalk = require("chalk"),
	fetch = require("node-fetch"),
	Discord = require("discord.js"),
	Fortnite = require("fortnite");

module.exports.run = async (config) => {
	// This will check if the config is correct
	logger.log("=-=-=-=-=-=-=- Config file Verification -=-=-=-=-=-=-=");
	logger.log("Verifing config..");
	let error;

	// Make sure Node.js V12 or higher is being ran.
	if (process.version.slice(1).split(".")[0] < 14) {
		logger.error("Node 14 or higher is required.");
		error = true;
	}

	// check owner ID
	if (!config.ownerId) {
		logger.error(`${chalk.red("✗")} Bot ownerId is missing.`);
		error = true;
	}

	// check token
	if (!config.token) {
		logger.error(`${chalk.red("✗")} Bot token is missing.`);
		error = true;
	} else {
		const client = new Discord.Client({ intents: [] });
		await client.login(config.token).catch((e) => {
			if (e.message == "An invalid token was provided.") {
				logger.error(`${chalk.red("✗")} Bot token is incorrect.`);
				error = true;
			}
		});
	}
	// Check Ksoft API
	if (!config.api_keys.ksoft) {
		logger.log(`${chalk.red("✗")} Ksoft API key is missing.`);
		error = false;
	} else {
		const ksoft = new KSoftClient(config.api_keys.ksoft);
		const resp = await ksoft.images.meme();
		if (!resp.url) {
			logger.log(`${chalk.red("✗")} Ksoft API key is incorrect.`);
			error = false;
		}
	}

	// Check for bot list API keys
	// if (config.DiscordBotLists) {
	// 	// Check discord api
	// 	if (!config.DiscordBotLists.DiscordBoatAPI_Key) {
	// 		logger.log(`${chalk.red('✓')} Discord Boat API key is missing.`);
	// 		error = false;
	// 	}
	// 	if (!config.DiscordBotLists.ArcaneBotAPI_KEY) {
	// 		logger.log(`${chalk.red('✓')} Arcane Bot API key is missing.`);
	// 		error = false;
	// 	}
	// 	if (!config.DiscordBotLists.botlist_spaceAPI_KEY) {
	// 		logger.log(`${chalk.red('✓')} Botlist Space API key is missing.`);
	// 		error = false;
	// 	}
	// }

	// Check support server set up
	if (!config.SupportServer) {
		logger.error(`${chalk.red("✗")} Support server setup is missing.`);
		error = true;
	}

	// Check fall back server settings setup
	if (!config.defaultSettings) {
		logger.error(`${chalk.red("✗")} Fallback server settings is missing.`);
		error = true;
	}

	// Check mongodb connection
	if (!config.MongoDBURl) {
		logger.error(`${chalk.red("✗")} MongoDB URl is missing.`);
		error = true;
	} else {
		const mongoose = require("mongoose");
		await mongoose
			.connect(config.MongoDBURl, {
				useUnifiedTopology: true,
				useNewUrlParser: true,
			})
			.catch((err) => {
				console.log(err);
				logger.error(
					`${chalk.red("✗")} Unable to connect to database.`
				);
				error = true;
			});
	}

	// keep at end
	if (!error) {
		logger.log(`${chalk.green("✓")} Config has been verified.`);
		error = false;
		return error;
	} else {
		logger.error(`${chalk.red("✗")} Config has errors to fix.`);
		return error;
	}
};
