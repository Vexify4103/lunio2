module.exports = (member, { VCToggle, VCs }) => {
	if (!member.voice.channel) return false;
	// Check if the member has role to interact with music plugin
	if (VCToggle) {
		if (VCs.includes(member.voice.channel.id)) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
};
