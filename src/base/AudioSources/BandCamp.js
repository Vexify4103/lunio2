const bandcamp = require("bandcamp-scraper");

class BandCamp {
	constructor(bot) {
		this.bot = bot;
		// Other initialization code...
	}

	search(query) {
		return new Promise((resolve, reject) => {
			bandcamp.search({ query, page: 1 }, (error, searchResults) => {
				if (error) {
					reject(error);
				} else {
					const formattedResults = searchResults
						.map((result) => {
							if (result.type === "track") {
								return {
									type: "TRACK_LOADED",
									track: {
										title: result.name,
										author: result.artist,
										uri: result.url,
										identifier: result.url,
										duration: 0, // Set the duration to 0 for now, as it's not provided by Bandcamp
									},
								};
							} else if (result.type === "album") {
								return {
									type: "PLAYLIST_LOADED",
									playlist: {
										name: result.name,
										author: result.artist,
										uri: result.url,
										tracks: [], // For playlists, initialize an empty array for tracks
									},
								};
							} else {
								return null;
							}
						})
						.filter((result) => result !== null);

					resolve(formattedResults);
				}
			});
		});
	}

	// Other methods...
}

module.exports = BandCamp;
