const { PlaylistSchema } = require('../../../database/models')

module.exports = async (name, userId, settings) => {
     try {
		await PlaylistSchema.findOneAndUpdate({
			name: name,
               creator: userId
		},
		settings, {
			upsert: true
		});
		return true;
	} catch (error) {
		return false;
	}
};