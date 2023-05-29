const { Schema, model } = require("mongoose");

const guildSchema = Schema({
	//IDENTIFIER
	guildID: String,

	// Guild Admin Settings
	Announce: { type: Boolean, default: true },
	DelAnnounce: { type: Boolean, default: false },
	Language: { type: String, default: "en-US" },
	SongUserLimit: { type: Number, default: 0 },
	SongTimeLimitMS: { type: Number, default: 0 },
	Playlists: { type: Boolean, default: true },
	Requester: { type: Boolean, default: true },
	VCToggle: { type: Boolean, default: false },
	VCs: { type: Array, default: [] },
	// DJ Settings
	MusicDJ: { type: Boolean, default: false },
	MusicDJRole: { type: Array, default: [] },
	// Custom Channel
	CustomChannel: { type: Boolean, default: false },
	mChannelID: { type: String, default: "none" },
	mChannelEmbedID: { type: String, default: "none" },
	mChannelBannerID: { type: String, default: "none" },
	mChannelUpdateInProgress: { type: Boolean, default: false },
	// PREMIUM
	permpremium: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	premiumExpireDate: { type: Number, default: 0},
	expireDate: { type: Date, default: null },
	DefaultVol: { type: Number, default: 100 },
	twentyFourSeven: { type: Boolean, default: false },
	// STUFF SO THAT BOT WORKS...
	plugins: { type: Array, default: ["Everyone", "DJ", "Admin", "Premium"] },
	version: {
		type: Number,
		default: require("../../config.js").defaultSettings.version,
	},
});

module.exports = model("Guild", guildSchema);
