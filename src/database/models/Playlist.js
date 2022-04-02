const { Schema, model } = require('mongoose');

const playlistSchema = Schema({
	name: String,
	songs: Array,
	timeCreated: { type: String, default: `<t:${Math.floor(new Date().getTime()/1000.0)}>`},
	creator: String,
	duration: { type: Number, default: 0 },
});

module.exports = model('playlists', playlistSchema);
