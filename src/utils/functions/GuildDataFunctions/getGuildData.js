const { GuildSchema } = require("../../../database/models");

module.exports = async (bot, guildId) => {
	let settings = await GuildSchema.findOne({
		guildID: guildId,
	});
	if (!settings) {
		settings = bot.config.defaultSettings;
		settings.guildID = guildId;
	}
	return settings;
};
