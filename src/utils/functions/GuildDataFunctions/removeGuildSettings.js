const { GuildSchema } = require('../../../database/models')

module.exports = async (guildId) => {
     try {
		await GuildSchema.findByIdAndRemove({
		    guildID: guildId
		});
		return true;
	 } catch (error) {
		return false;
	 }
};