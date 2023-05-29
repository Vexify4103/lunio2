const { createRegExp, exactly, global, multiline } = require("magic-regexp");

module.exports = async (bot, res) => {
	let blockedWords = bot.config.blockedWords;

	const newRes = { ...res };

	for (const track of newRes.tracks) {
		track.author = replaceAuthor(track);
		track.title = removeBlockedWords(blockedWords, track);
		// track.author = checkAuthor(track);
	}
    // console.log(newRes)
	//console.log(newRes.tracks);
	return newRes.tracks;

	function removeBlockedWords(blockedWords, track) {
		let str = track.title;

        const dashIndex = track.title.indexOf("-");
        if (dashIndex !== -1) {
            str = track.title = track.title.slice(dashIndex + 1).trim();
        }
        //console.log(str);
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

	function replaceAuthor(track) {
        let str = track.author;
		const dashIndex = track.title.indexOf("-");
        if (dashIndex !== -1) {
            const titleAuthor = track.title.slice(0, dashIndex).trim();
            if (titleAuthor.toLowerCase() !== str.toLowerCase()) {
                if (titleAuthor) {
                    str = titleAuthor;
                } else {
                    str = track.author;
                }
            } else {
                str = track.author;
            }
        }

        return str;
	}
	// function checkAuthor(track) {
	// 	let str = track.author;
	// 	const dashIndex = track.title.indexOf("-");
	// 	if (dashIndex !== -1) {
	// 		const titleAuthor = track.title.slice(0, dashIndex).trim();
	// 		// console.log(str)
	// 		// console.log(titleAuthor)
	// 		// console.log("--------------")
	// 		if (titleAuthor.toLowerCase() !== track.author.toLowerCase()) {
	// 			if (titleAuthor) {
	// 				track.title = track.title.slice(dashIndex + 1).trim();
	// 			} else {
	// 				str = track.author; // Assign original author back to str if it becomes empty
	// 			}
	// 		} else {
	// 			str = titleAuthor;
	// 			track.title = track.title.slice(dashIndex + 1).trim();
	// 		}
	// 	}
	// 	return str;
	// }
};
