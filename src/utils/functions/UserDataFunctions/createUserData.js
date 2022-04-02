const { userSchema } = require('../../../database/models')

module.exports = async (settings) => {
     try {
		const newUser = new userSchema(settings)
		return await newUser.save(); 
	} catch (error) {
		return false;
	}
};