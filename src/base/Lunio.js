// Dependencies
const {
		Client,
		Collection,
		Partials,
		GatewayIntentBits,
		IntentsBitField,
		ActivityType,
	} = require("discord.js"),
	{ GuildSchema } = require("../database/models"),
	path = require("path"),
	{ promisify } = require("util");
const AudioManager = require("./AudioManager");
const BandCamp = require("./AudioSources/BandCamp");
const SoundCloud = require("./AudioSources/soundCloud");
const readdir = promisify(require("fs").readdir);

// Creates Lunio class
class Lunio extends Client {
	constructor() {
		super({
			messageCacheMaxSize: -1,
			messageCacheLifetime: 1210000,
			restTimeOffset: 0,
			partials: [
				Partials.GuildMember,
				Partials.User,
				Partials.Channel,
				Partials.Reaction,
				Partials.Message,
			],
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.MessageContent,
			],
			failIfNotExists: false,
			restGlobalRateLimit: 50,
			presence: {
				status: "online",
				activities: [
					{
						name: "/help",
						type: ActivityType.Listening,
					},
				],
			},
		});
		// for console logging
		this.logger = require("../utils/Logger");

		// For command handler
		this.aliases = new Collection();
		this.commands = new Collection();
		this.interactions = new Collection();
		this.cooldowns = new Collection();
		// connect to database
		this.mongoose = require("../database/mongoose");
		// config file
		this.config = require("../config.js");
		// for Activity
		this.Activity = [];
		this.PresenceType = "LISTENING";
		// Basic statistics for the bot
		this.messagesSent = 0;
		this.commandsUsed = 0;
		// for waiting for things
		this.delay = (ms) => new Promise((res) => setTimeout(res, ms));

		//functionsForAudioSources
		this.bandCamp = new BandCamp(this);
		//functionsForAudio
		this.progressBar = require("../utils/functions/AudioFunctions/ProgressBar"); // maxtime, currenttime
		this.checkDJ = require("../utils/functions/AudioFunctions/checkDJ"); // member, settings { MusicDJ, MusicDJRole }
		this.checkVC = require("../utils/functions/AudioFunctions/checkVC"); //member, settings { VCToggle, VCs }
		this.isrequestchannel = require("../utils/functions/AudioFunctions/isRequestChannel"); // channelid, settings { CustomChannel, mChannelID }
		this.search = require("../utils/functions/AudioFunctions/search"); // bot, msg, search, settings { mChannelID, mChannelEmbedID, DefaultVol, SongUserLimit, SongTimeLimitMS, Playlists, Language }
		this.disablebuttons = require("../utils/functions/AudioFunctions/disablebuttons"); // bot, settings { mChannelID, mChannelEmbedID }
		this.musicembed = require("../utils/functions/AudioFunctions/musicembed"); // bot, player, settings { mChannelID, mChannelEmbedID, Requester, Language }
		this.musicoff = require("../utils/functions/AudioFunctions/musicoff"); // bot, settings { mChannelID, mChannelEmbedID, Language }
		this.getduration = require("../utils/functions/AudioFunctions/getduration"); // duration
		this.read24hFormat = require("../utils/functions/AudioFunctions/read24hFormat"); // text
		this.replaceTitle = require("../utils/functions/AudioFunctions/replaceTitle"); // bot, res
		this.refreshEmbed = require("../utils/functions/AudioFunctions/refreshEmbed"); // bot, settings

		//functionsForPlalists
		this.createPlaylist = require("../utils/functions/PlaylistFunctions/createPlaylist"); // bot, settings
		this.deletePlaylist = require("../utils/functions/PlaylistFunctions/deletePlaylist"); // userId, playlistName
		this.existPlaylist = require("../utils/functions/PlaylistFunctions/existPlaylist"); // userId, playlistName
		this.updatePlaylist = require("../utils/functions/PlaylistFunctions/updatePlaylist"); // name, userId, settings

		//functionsForGuildData
		this.createGuildData = require("../utils/functions/GuildDataFunctions/createGuildData"); // settings
		this.deleteGuildData = require("../utils/functions/GuildDataFunctions/deleteGuildData"); // guildId
		this.getGuildData = require("../utils/functions/GuildDataFunctions/getGuildData"); // bot, guildId
		this.removeGuildSettings = require("../utils/functions/GuildDataFunctions/removeGuildSettings"); // guildId, sett
		this.updateGuildSettings = require("../utils/functions/GuildDataFunctions/updateGuildSettings"); // guildId, settings

		//functionsForUserData
		this.createUserData = require("../utils/functions/UserDataFunctions/createUserData"); // settings
		this.deleteUserData = require("../utils/functions/UserDataFunctions/deleteUserData"); // userId
		this.getUserData = require("../utils/functions/UserDataFunctions/getUserData"); // bot, userId
		this.removeUserSettings = require("../utils/functions/UserDataFunctions/removeUserSettings"); // userId
		this.updateUserSettings = require("../utils/functions/UserDataFunctions/updateUserSettings"); // userId, settings
		this.pushBannedGuilds = require("../utils/functions/UserDataFunctions/pushBannedGuilds"); // userId, guildId

		//functionsForUtils
		this.codeBlock = require("../utils/functions/UtilFunctios/codeBlock"); // textToCodeBlock
		this.getColor = require("../utils/functions/UtilFunctios/getColor"); // bot, guildId
		this.delay = require("../utils/functions/UtilFunctios/delay"); // bot, TimeInMS
		// for audio
		this.manager = new AudioManager(this);
	}

	// Function for getting translations
	translate(locale, key, args) {
		if (!locale) locale = require("../config").defaultSettings.Language;
		const language = this.translations.get(locale);
		if (!language) return "Invalid language set in data.";
		return language(key, args);
	}

	// Delete guild from server when bot leaves server
	async DeleteGuild(guild) {
		try {
			await GuildSchema.findOneAndRemove({
				guildID: guild.id,
			});
			return true;
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}
	// Load a command
	loadCommand(commandPath, commandName) {
		const cmd = new (require(`.${commandPath}${path.sep}${commandName}`))(
			this
		);
		this.logger.log(`Loading Command: ${cmd.help.name}.`);
		cmd.conf.location = commandPath;
		this.commands.set(cmd.help.name, cmd);
		cmd.help.aliases.forEach((alias) => {
			this.aliases.set(alias, cmd.help.name);
		});
	}
}

module.exports = Lunio;
