const { GuildSchema } = require("../../../database/models");

module.exports = async (settings) => {
	try {
		const newGuild = new GuildSchema(settings);
		return await newGuild.save();
	} catch (error) {
		console.log(error);
		return false;
	}
};
