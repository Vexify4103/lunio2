module.exports = async (channelid, settings) => {
	if (settings.CustomChannel) {
		if (channelid === settings.mChannelID) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};