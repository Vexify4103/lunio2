const { userSchema } = require("../../../database/models");

module.exports = async (bot, userId) => {
	let setting = await userSchema.findOne({
		userID: userId,
	});

	if (!setting) {
		setting = bot.config.defaultUserSettings;
		setting.userID = userId;
	}
	return setting;
};
