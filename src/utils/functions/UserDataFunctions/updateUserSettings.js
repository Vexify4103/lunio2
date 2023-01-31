const { userSchema } = require("../../../database/models");

module.exports = async (user, settings) => {
	try {
		await userSchema.findOneAndUpdate(
			{
				userID: user.id,
				userNAME: user.username + "#" + user.discriminator,
			},
			settings,
			{
				upsert: true,
			}
		);
	} catch (error) {
		console.log(error);
	}
};
