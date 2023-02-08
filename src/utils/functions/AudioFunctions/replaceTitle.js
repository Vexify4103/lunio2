module.exports = async (bot, res) => {
	let blockedWords = bot.config.blockedWords;

	const newRes = { ...res };

	let bool = testForIterable(newRes);

	if (bool) {
		for (const track of newRes.tracks) {
			track.title = removeBlockedWords(blockedWords, track);
		}
		return newRes;
	} else {
		newRes.title = removeBlockedWords(blockedWords, res);
		return newRes.title;
	}
	function removeBlockedWords(blockedWords, track) {
		let str = track.title;
		// check if auhtor exists in title, if yes add author to blockedWords// check if auhtor exists in title, if yes add author to blockedWords
		if (str.toLowerCase().includes(track.author.toLowerCase())) {
			blockedWords = blockedWords.concat(track.author.split(" "));

			let dashIndex = str.indexOf("-");
			if (dashIndex !== -1) {
				str = str.slice(dashIndex + 1).trim();
			}
		}
		//console.log(track.author);
		blockedWords = blockedWords.map((word) => word.toLowerCase());
		//console.log(blockedWords);

		// const parts = str.split("-");
		// const author = parts[0].trim();
		// // track.author = author;
		// if (parts[1]) {
		// 	str = parts[1].trim();
		// }
		//str = parts[1].trim();

		for (const blocked of blockedWords) {
			const regex = new RegExp(`\\b${blocked}\\b`, "gi");
			if (str.toLowerCase().includes(blocked)) {
				str = str.replace(regex, "");
			}
		}
		str = str.replace(/[\(\)\[\]\{\}'"`]+/g, " ").trim();
		str = str.replace(/\s{2,}/g, " ");

		return str;
	}
	function testForIterable(obj) {
		if (obj === null || obj === undefined) return false;

		if (obj?.tracks) {
			return true;
		}
		if (obj?.title) {
			return false;
		}
		return;
	}
};
