const { Schema, model } = require("mongoose");
// const dayjs = require('dayjs');
// const duration = require('dayjs/plugin/duration');
// dayjs.extend(duration);
// const date = dayjs().add(dayjs.duration({'months' : 1}));

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
	mChannelUpdateInProgress: { type: Boolean, default: false},
	// PREMIUM
	permpremium: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	expireDate: { type: Number, default: 0 },
	DefaultVol: { type: Number, default: 100 },
	// STUFF SO THAT BOT WORKS...
	plugins: { type: Array, default: ["Everyone", "DJ", "Admin", "Premium"] },
	version: {
		type: Number,
		default: require("../../config.js").defaultSettings.version,
	},
});

module.exports = model("Guild", guildSchema);
