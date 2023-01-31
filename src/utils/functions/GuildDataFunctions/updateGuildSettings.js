const { GuildSchema } = require("../../../database/models");

module.exports = async (guildId, settings) => {
	try {
		await GuildSchema.findOneAndUpdate(
			{
				guildID: guildId,
			},
			settings,
			{
				upsert: true,
			}
		);
		return true;
	} catch (error) {
		return false;
	}
};
