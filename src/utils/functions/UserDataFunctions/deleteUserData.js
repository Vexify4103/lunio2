const { userSchema } = require('../../../database/models')

module.exports = async (userId) => {
     try {
		await userSchema.findOneAndRemove({
			userID: userId
		});
		return true;
	} catch (error) {
		return false;
	}
};