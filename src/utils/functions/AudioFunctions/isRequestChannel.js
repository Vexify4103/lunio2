module.exports = async (channelid, { CustomChannel, mChannelID }) => {
	if (CustomChannel) {
		if (channelid === mChannelID) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};
