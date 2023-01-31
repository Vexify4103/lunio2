const { GuildSchema } = require("../../../database/models");

module.exports = async (guildId) => {
	try {
		await GuildSchema.findOneAndRemove({
			guildID: guildId,
		});
		return true;
	} catch (error) {
		return false;
	}
};
