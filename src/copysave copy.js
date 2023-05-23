const { createRegExp, exactly, global, multiline } = require("magic-regexp");

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

		if (str.toLowerCase().includes(track.author.toLowerCase())) {
			blockedWords.push(...track.author.split(" "));
			const dashIndex = str.indexOf("-");
			if (dashIndex !== -1) {
				str = str.slice(dashIndex + 1).trim();
			}
		}

		const blockedWordsLowerCase = blockedWords.map((word) =>
			word.toLowerCase()
		);

		for (const blocked of blockedWordsLowerCase) {
			const regex = new RegExp(`\\b${blocked}\\b`, "gi");
			str = str.replace(regex, "");
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
