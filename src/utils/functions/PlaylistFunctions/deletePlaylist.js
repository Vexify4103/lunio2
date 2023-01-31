const { PlaylistSchema } = require("../../../database/models");

module.exports = async (userId, playlistName) => {
	try {
		await PlaylistSchema.findOneAndRemove({
			name: playlistName,
			creator: userId,
		});
		return true;
	} catch (error) {
		return false;
	}
};
