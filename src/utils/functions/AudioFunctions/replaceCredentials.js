const { createRegExp, exactly, global, multiline } = require("magic-regexp");

module.exports = async (bot, res) => {
	let blockedWords = bot.config.blockedWords;

	const newRes = { ...res };

	let bool = testForIterable(newRes);

	if (bool) {
		for (const track of newRes.tracks) {
			track.title = removeBlockedWords(blockedWords, track);
			track.author = checkAuthor(track);
		}
		//console.log(newRes);
		return newRes.tracks;
	} else {
		newRes.title = removeBlockedWords(blockedWords, res);
		newRes.author = checkAuthor(res);
		//console.log(newRes.title);
		return [newRes];
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

	function checkAuthor(track) {
		let str = track.author;
		const dashIndex = track.title.indexOf("-");
		if (dashIndex !== -1) {
			const titleAuthor = track.title.slice(0, dashIndex).trim();
			if (titleAuthor.toLowerCase() !== track.author.toLowerCase()) {
				str = titleAuthor;
			}
		}
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
