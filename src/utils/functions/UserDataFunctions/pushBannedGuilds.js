const { userSchema } = require("../../../database/models");

module.exports = async (userId, guildId) => {
	try {
		await userSchema.findOneAndUpdate(
			{
				userID: userId,
			},
			{
				$push: {
					guilds: guildId,
				},
			},
			{
				upsert: true,
			}
		);
		return true;
	} catch (error) {
		return false;
	}
};
