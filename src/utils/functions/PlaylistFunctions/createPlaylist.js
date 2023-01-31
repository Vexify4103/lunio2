const { PlaylistSchema } = require("../../../database/models");

module.exports = async (bot, settings) => {
	try {
		const newPlaylist = new PlaylistSchema(settings);
		return await newPlaylist.save();
	} catch (error) {
		bot.logger.error(`Error creating new playlist ${error}`);
		return false;
	}
};
