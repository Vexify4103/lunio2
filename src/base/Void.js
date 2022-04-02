// Dependencies
const {
	Client,
	Collection
} = require('discord.js'), {
		GuildSchema
	} = require('../database/models'), {
		KSoftClient
	} = require('@ksoft/api'),
	path = require('path'), {
		promisify
	} = require('util')
const AudioManager = require('./Audio-Manager');
const readdir = promisify(require('fs').readdir);

// Creates Void class
class Void extends Client {
	constructor() {
		super({
			messageCacheMaxSize: -1,
			messageCacheLifetime: 1210000,
			restTimeOffset: 0,
			partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION'],
			intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_INVITES'],
			restGlobalRateLimit: 50,
			presence: {
				status: 'online',
				activities: [{
					name: '/help',
					type: 'LISTENING',
					url: 'https://www.twitch.tv/vexi_fy',
				}],
			},
		});
		// for console logging
		this.logger = require('../utils/Logger');

		// For command handler
		this.aliases = new Collection();
		this.commands = new Collection();
		this.interactions = new Collection();
		this.cooldowns = new Collection();
		// connect to database
		this.mongoose = require('../database/mongoose');
		// config file
		this.config = require('../config.js');
		// for Activity
		this.Activity = [];
		this.PresenceType = 'LISTENING';
		// for KSOFT API
		if (this.config.api_keys.ksoft) {
			this.Ksoft = new KSoftClient(this.config.api_keys.ksoft);
		}
		// Basic statistics for the bot
		this.messagesSent = 0;
		this.commandsUsed = 0;
		// for emojis
		// for waiting for things
		this.delay = ms => new Promise(res => setTimeout(res, ms));

		//functionsForAudio
		this.progressBar = require('../utils/functions/AudioFunctions/ProgressBar'); // maxtime, currenttime
		this.checkDJ = require('../utils/functions/AudioFunctions/checkDJ'); // member, settings
		this.checkVC = require('../utils/functions/AudioFunctions/checkVC'); //member, settings
		this.isrequestchannel = require('../utils/functions/AudioFunctions/isRequestChannel'); // channelid, settings
		this.search = require('../utils/functions/AudioFunctions/search'); // bot, msg, search, settings
		this.musicembed = require('../utils/functions/AudioFunctions/musicembed'); // bot, player, settings
		this.musicoff = require('../utils/functions/AudioFunctions/musicoff'); // bot, settings
		this.getduration = require('../utils/functions/AudioFunctions/getduration'); // duration
		this.read24hFormat = require('../utils/functions/AudioFunctions/read24hFormat') // text

		//functionsForPlalists
		this.createPlaylist = require('../utils/functions/PlaylistFunctions/createPlaylist'); // bot, settings
		this.deletePlaylist = require('../utils/functions/PlaylistFunctions/deletePlaylist'); // userId, playlistName
		this.existPlaylist = require('../utils/functions/PlaylistFunctions/existPlaylist'); // userId, playlistName
		this.updatePlaylist = require('../utils/functions/PlaylistFunctions/updatePlaylist'); // name, userId, settings

		//functionsForGuildData
		this.createGuildData = require('../utils/functions/GuildDataFunctions/createGuildData'); // settings
		this.deleteGuildData = require('../utils/functions/GuildDataFunctions/deleteGuildData'); // guildId
		this.getGuildData = require('../utils/functions/GuildDataFunctions/getGuildData'); // bot, guildId
		this.removeGuildSettings = require('../utils/functions/GuildDataFunctions/removeGuildSettings'); // guildId, sett
		this.updateGuildSettings = require('../utils/functions/GuildDataFunctions/updateGuildSettings'); // guildId, settings

		//functionsForUserData
		this.createUserData = require('../utils/functions/UserDataFunctions/createUserData'); // settings
		this.deleteUserData = require('../utils/functions/UserDataFunctions/deleteUserData'); // userId
		this.getUserData = require('../utils/functions/UserDataFunctions/getUserData'); // bot, userId
		this.removeUserSettings = require('../utils/functions/UserDataFunctions/removeUserSettings'); // userId		
		this.updateUserSettings = require('../utils/functions/UserDataFunctions/updateUserSettings'); // userId, settings
		this.pushBannedGuilds = require('../utils/functions/UserDataFunctions/pushBannedGuilds'); // userId, guildId

		//functionsForUtils
		this.codeBlock = require('../utils/functions/UtilFunctios/codeBlock'); // textToCodeBlock
		this.getColor = require('../utils/functions/UtilFunctios/getColor'); // bot, guildId
		this.delay = require('../utils/functions/UtilFunctios/delay'); // bot, TimeInMS
		// for audio
		this.manager = new AudioManager(this);
	}

	// Function for getting translations
	translate(locale, key, args) {
		if (!locale) locale = require('../config').defaultSettings.Language;
		const language = this.translations.get(locale);
		if (!language) return 'Invalid language set in data.';
		return language(key, args);
	}

	// Delete guild from server when bot leaves server
	async DeleteGuild(guild) {
		try {
			await GuildSchema.findOneAndRemove({
				guildID: guild.id
			});
			return true;
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}
	// Set bot's activity
	SetActivity(type, array = []) {
		this.Activity = array;
		this.PresenceType = type;
		try {
			let j = 0;
			setInterval(() => this.user.setActivity(`${this.Activity[j++ % this.Activity.length]}`, {
				type: type,
				url: 'https://www.twitch.tv/vexi_fy'
			}), 300000);
			return;
		} catch (e) {
			console.log(e);
		}
	}
	// Load a command
	loadCommand(commandPath, commandName) {
		const cmd = new(require(`.${commandPath}${path.sep}${commandName}`))(this);
		this.logger.log(`Loading Command: ${cmd.help.name}.`);
		cmd.conf.location = commandPath;
		this.commands.set(cmd.help.name, cmd);
		cmd.help.aliases.forEach((alias) => {
			this.aliases.set(alias, cmd.help.name);
		});
	}
	// Loads a slash command category
	async loadInteractionGroup(category) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			commands.forEach((cmd) => {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new(require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						const item = {
							name: command.help.name,
							description: command.help.description,
							defaultPermission: command.conf.defaultPermission,
						};
						if (command.conf.options[0]) {
							item.options = command.conf.options;
						}
						arr.push(item);
					}
				}
			});
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}
	// Deletes a slash command category
	async deleteInteractionGroup(category, guild) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			commands.forEach((cmd) => {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new(require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						arr.push({
							name: command.help.name,
							description: command.help.description,
							options: command.conf.options,
							defaultPermission: command.conf.defaultPermission,
						});
						guild.interactions.delete(command.help.name, command);
					}
				}
			});
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}
	// Unload a command (you need to load them again)
	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) {
			command = this.commands.get(commandName);
		} else if (this.aliases.has(commandName)) {
			command = this.commands.get(this.aliases.get(commandName));
		}
		if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}
	// Handle slash command callback
	async send(interaction, content) {
		await interaction.reply(content);
		if (this.config.debug) this.logger.debug(`Interaction: ${interaction.commandName} was ran by ${interaction.user.username}.`);
		this.commandsUsed++;
	}
	// for adding embeds to the webhook manager
	addEmbed(channelID, embed) {
		// collect embeds
		if (!this.embedCollection.has(channelID)) {
			this.embedCollection.set(channelID, [embed]);
		} else {
			this.embedCollection.set(channelID, [...this.embedCollection.get(channelID), embed]);
		}
	}
}

module.exports = Void;