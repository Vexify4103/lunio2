const config = {
	// replace BOTID with the bot's ID
	inviteLink:
		"https://discord.com/api/oauth2/authorize?client_id=945474723846950944&permissions=36826192&scope=applications.commands%20bot",
	premiumLink: "https://www.patreon.com/luniobot",
	connectLink: "https://www.patreon.com/settings/apps",
	voteLink: "https://top.gg/bot/945030475779551415",
	translationLink: "https://crwd.in/luniobot",
	disabledCommands: [],
	disabledPlugins: [],
	websiteURL: "Bot's dashboard",
	// your support server
	SupportServer: {
		// Link to your support server
		link: "https://discord.gg/rrqEFukVUZ",
		// Your support's server ID
		GuildID: "866666289178869770",
		// This for using the suggestion command on your server
		ModRole: "785285760064159745",
		// What channel to post the suggestions
		SuggestionChannel: "848571986287919104",
		// Where the bot will send Guild join/leave messages to
		GuildChannel: "866691788349898793",
	},
	// THESE SETTINGS ARE FOR GUILDS ONLY
	defaultSettings: {
		//IDENTIFIER
		guildID: "00",

		// Guild Admin Settings
		Announce: true,
		DelAnnounce: false,
		Language: "en-US",
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
		mChannelUpdateInProgress: false,
		// PREMIUM
		permpremium: false,
		premium: false,
		expireDate: 0,
		DefaultVol: 100,
		twentyFourSeven: false,
		// STUFF SO THAT BOT WORKS...
		plugins: ["Everyone", "DJ", "Admin", "Premium"],
		version: 1.0,
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
		defaultPlaylist: "songs",
		maxSongsInPlaylist: 100,
		//PREMIUM GUILD SETTINGS
		premiumUses: 0,
		// USER BANNED SETTINGS
		guilds: [],
		// Will be used for the website
		Language: "en-US",
	},
	changeableSettings: {
		maxSongsInPlaylist: 15,
		//refreshEmbedTime: 5000,
		refreshEmbedTime: 1000 * 60 * 60 * 3,
	},
	// embedColor: '#06dadd', //lunio
	embedColor: "#05db4c", //lunio 2
	// color: "#06dadd", //lunio
	color: "#05db4c", //lunio 2
	colorTrue: "#00FF9B",
	colorWrong: "#FF3A00",
	colorOrange: "#FFD800",
	DeleteTimeout: 15000,
	LeaveTimeout: 1000 * 60 * 30, //1000 * 60 * 30
	// music_playing_banner: 'https://media.discordapp.net/attachments/866678034298568745/1038244662323974184/playing_image.png?width=1190&height=670', //lunio
	music_playing_banner:
		"https://media.discordapp.net/attachments/866678034298568745/1038244679222833192/playing_image2.png?width=1190&height=670", //lunio 2
	no_music:
		"https://media.discordapp.net/attachments/866678034298568745/1038251527380410488/no_music.png?width=1190&height=670",
	// music_banner: "https://media.discordapp.net/attachments/866678034298568745/1038244629247688814/banner.png", //lunio
	music_banner:
		"https://media.discordapp.net/attachments/866678034298568745/1038244645555154954/banner2.png", //lunio 2
	// avatarURL: "https://cdn.discordapp.com/attachments/866678034298568745/1038244587858301019/logo.png", //lunio
	avatarURL:
		"https://cdn.discordapp.com/attachments/866678034298568745/1038244607852544100/logo2.png", //lunio 2
	googlelogo:
		"https://media.discordapp.net/attachments/866678034298568745/1040058767942877214/google.png?width=670&height=670",
	debug: false,

	blockedWords: [
		"remix",
		"re-mix",
		"lyrics",
		"lyric",
		"official-musicvideo",
		"official-audio",
		"audio",
		"official",
		"musicvideo",
		"music-video",
		"music video",
		"video",
		"vevo",
		"official mv",
		"official-mv",
		"official visualizer",
		"official-visualizer",
		"visualizer",
		"official video",
		"lyric video",
		"original mix",
		"full version",
		"mix",
		"vod",
		"bass boosted",
		"boosted",
		"bass",
		"animated",
		"reverb",
		"official video",
		"m/v",
	],
};

module.exports = config;
