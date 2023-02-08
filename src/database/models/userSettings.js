const { Schema, model } = require("mongoose");
// const dayjs = require('dayjs');
// const duration = require('dayjs/plugin/duration');
// dayjs.extend(duration);
// const date = dayjs().add(dayjs.duration({'months' : 1}));

const userSchema = Schema({
	//IDENTIFIER
	userID: { type: String, default: "N/A" },
	userNAME: { type: String, default: "N/A" },
	// VOTED
	hasVoted: { type: Boolean, default: false },
	votedTime: { type: Number, default: 0 },
	//PREMIUM USER SETTINGS
	permpremium: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	expireDate: { type: Number, default: 0 },
	// PLAYLIS COMMANDS
	defaultPlaylist: { type: String, default: "songs" },
	maxSongsInPlaylist: { type: Number, default: 100 },
	//PREMIUM GUILD SETTINGS
	premiumUses: { type: Number, default: 0 },
	// USER BANNED SETTINGS
	guilds: { type: Array, default: [] },
	// Will be used for the website
	Language: { type: String, default: "en-US" },
});

module.exports = model("Users", userSchema);
