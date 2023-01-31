module.exports = async (bot, res) => {
	let blockedWords = bot.config.blockedWords;

	let bool = testForIterable(res);

	if (bool) {
		for (const track of res.tracks) {
			// // remove artist name from title
			// let artists = track.author.split(" ");
			// for (const artist of artists) {
			//   var regex2 = new RegExp(artist, "gi")
			//   if (track.title.toLowerCase().includes(artist)) {
			//     track.title = track.title.replace(regex2, "");
			//   }
			// }

			// remove blocked words from title
			for (const blocked of blockedWords) {
				var regex = new RegExp(blocked, "gi");
				if (track.title.toLowerCase().includes(blocked)) {
					track.title = track.title.replace(regex, "");
					//title = title.replace(/\s+/g, ' ').trim();
					//track.title = track.title.replace(/[^\w\s-]/gi, "");
					track.title = track.title.replace(/\(\s*\)/gi, "");
					track.title = track.title.replace(/ *\[[^\]]*\] */gi, "");
				}
			}
		}
		return res;
	} else {
		try {
			// // remove artist from title
			// let artists = res.author.split(" ");
			// for (const artist of artists) {
			//   var regex2 = new RegExp(artist, "gi")
			//   if (res.title.toLowerCase().includes(artist)) {
			//     res.title = res.title.replace(regex2, "")
			//   }
			// }

			// remove blocked words from title
			for (const blocked of blockedWords) {
				var regex = new RegExp(blocked, "gi");
				if (res.title.toLowerCase().includes(blocked)) {
					res.title = res.title.replace(regex, "");
					//res.title = res.title.replace(/[^\w\s-]/gi, "");
					res.title = res.title.replace(/\(\s*\)/gi, "");
					res.title = res.title.replace(/ *\[[^\]]*\] */gi, "");
				}
			}
			return res;
		} catch (error) {
			bot.logger.error(error);
		}
	}

	function testForIterable(obj) {
		if (obj === null || obj === undefined) return false;

		if (obj?.tracks) {
			return true;
		}
		if (obj?.title) {
			return false;
		}
		return undefined;
	}
};
