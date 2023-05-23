module.exports = (member, { MusicDJ, MusicDJRole }) => {
	let has = [];
	// Check if the member has role to interact with music plugin
	if (MusicDJ) {
		for (let i = 0; i < MusicDJRole.length; i++) {
			if (member.roles.cache.has(`${MusicDJRole[i]}`))
				has.push(MusicDJRole[i]);
		}
		if (has.length > 0) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
};
