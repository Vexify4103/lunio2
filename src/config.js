const config = {
	ownerId: ['337568120028004362'],
	token: 'OTQ1NDc0NzIzODQ2OTUwOTQ0.YhQr9A.o9N6PW9T9bVVZWxjddgroAGDNmw',
	botClient: 'yoOwmjphpVP5EvMqBcgcCPtZ1Ky1DGsX',
	// replace BOTID with the bot's ID
	inviteLink: 'https://discord.com/api/oauth2/authorize?client_id=945474723846950944&permissions=36826192&scope=applications.commands%20bot',
	premiumLink: "https://www.patreon.com/voidmusicbot",
	connectLink: "https://www.patreon.com/settings/apps",
	voteLink: "https://top.gg/bot/945030475779551415",
	translationLink: "https://crwd.in/voidmusicbot",
	// For looking up Twitch, Fortnite, Steam accounts
	api_keys: {
		// https://dev.twitch.tv/console/apps
		twitch: {
			clientID: '',
			clientSecret: '',
		},
		// https://fortnitetracker.com/site-api
		fortnite: '',
		// https://api.ksoft.si/
		ksoft: '',
		// https://steamcommunity.com/dev
		steam: '',
		// https://developer.spotify.com/documentation/web-api/
		spotify: {
			iD: '4351d3136a764d0d9a9767539c415d95',
			secret: 'c6fad741d8cf4cdea15873931bf16991',
		},
		// Your Ubisoft email and password (You don't need to enable anything)
		rainbow: {
			email: 'xxaimfrostxx@gmail.com',
			password: 'Gioiosa1',
		},
		// https://genius.com/developers
		genuis: 'z-B0YZ5Hji0bhAURGOtuCo8ViGTmMjxFcrEsWO33IMLJMDIMuaE8OS9aOOQ7KfVI',
		// https://api.amethyste.moe/
		amethyste: '',
	},
	// add plugins/commands here if you don't want them loaded in the bot.
	disabledCommands: [],
	disabledPlugins: [],
	websiteURL: 'Bot\'s dashboard',
	// your support server
	SupportServer: {
		// Link to your support server
		link: 'https://discord.gg/rrqEFukVUZ',
		// Your support's server ID
		GuildID: '735649514815488120',
		// This for using the suggestion command on your server
		ModRole: '785285760064159745',
		// What channel to post the suggestions
		SuggestionChannel: '848571986287919104',
		// Where the bot will send Guild join/leave messages to
		GuildChannel: '866691788349898793',
	},
	// THESE SETTINGS ARE FOR GUILDS ONLY
	defaultSettings: {
		//IDENTIFIER
		guildID: '00',

		// Guild Admin Settings
		Announce: true,
		DelAnnounce: false,
		Language: 'en-US',
		SongUserLimit: 0,
		SongTimeLimitMS: 0,
		Playlists: true,
		Requester: true,
		VCToggle: false,
		VCs: [],
		// DJ Settings
		MusicDJ: false,
		MusicDJRole: [],
		// Custom Channel
		CustomChannel: false,
		mChannelID: "none",
		mChannelEmbedID: "none",
		mChannelBannerID: "none",
		// PREMIUM
		permpremium: false,
		premium: false,
		expireDate: 0,
		DefaultVol: 100,
		// STUFF SO THAT BOT WORKS...
		plugins: ["Everyone", "DJ", "Admin", "Premium"],
		version: 1.0
	},
	defaultUserSettings: {
		//IDENTIFIER
		userID: "N/A",
		userNAME: "N/A",
		// VOTED
		hasVoted: false,
		votedTime: 0,
		//PREMIUM USER SETTINGS
		permpremium: false,
		premium: false,
		expireDate: 0,
		// PLAYLIS COMMANDS
		defaultPlaylist: "Songs",
		//PREMIUM GUILD SETTINGS
		premiumUses: 0,
		// USER BANNED SETTINGS
		guilds: [],
		// Will be used for the website
		Language: 'en-US',
	},
	// LAVALINK SETTINGS
	lavalink: [{
			host: '0.0.0.0',
			port: 69,
			password: 'VM2!',
			//secure: true
		}, //{ host: 'lavalink.scpcl.site', port: 443, password: 'lvserver', secure: true} // { host: '0.0.0.0', port: 69, password: 'VM2!'}
	],
	// URL to mongodb
	MongoDBURl: 'mongodb+srv://Moody2:nyTDtBdOjjaYw6l6@cluster0.vnrhf.mongodb.net/Void2?retryWrites=true&w=majority',
	// embed colour
	embedColor: '#9400ff',
	color: "#9400ff",
	colorTrue: "#00FF9B",
	colorWrong: "#FF3A00",
	colorOrange: "#FFD800",
	DeleteTimeout: 15000,
	LeaveTimeout: 900000,
	music_playing_banner: 'https://cdn.discordapp.com/attachments/866678034298568745/946202422257279017/void2_playing_image_1920x1080.png',
	no_music: "https://cdn.discordapp.com/attachments/866667154988072960/959137330227200060/void_no_music.png",
	music_banner: "https://cdn.discordapp.com/attachments/866678034298568745/946204799429382194/void_banner.png",
	avatarURL: "https://cdn.discordapp.com/attachments/866678034298568745/947633820511903754/void_logo.png",
	geniusapilogo: "https://cdn.discordapp.com/attachments/866678034298568745/946240026822475867/365f0e9e7e66a120867b7b0ff340264a.png",
	debug: false,
};

module.exports = config;