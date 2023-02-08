const { userSchema } = require("../../../database/models");

module.exports = async (userID, settings) => {
	try {
		await userSchema.findOneAndUpdate(
			{
				userID: userID,
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
