const { userSchema } = require('../../../database/models');

module.exports = async (userId, settings) => {
     try {
		await userSchema.findOneAndUpdate({
			userID: userId
		}, {
               userID: userId,
               $unset: {
                    settings
               }
          }, {
               upsert: true,
               new: true
          });
	} catch (error) {
		return false;
	}
};