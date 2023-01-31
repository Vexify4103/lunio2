// Dependecies
const { Structure } = require("erela.js");

module.exports = Structure.extend("Player", (Player) => {
	class CustomPlayer extends Player {
		constructor(...args) {
			super(...args);
			// extra settings
			this.twentyFourSeven = false;
			this.previousTracks = [];
			this.skipSong = [];
			// for bot leave function
			this.timeout = null;
			// for filters
			this.speed = 1;
			this.nightcore = false;
			this.vaporwave = false;
			this.demon = false;
			// for Autoplay
			this.autoplay = false;
			this.bassboost = 0;
		}

		voteSkip(user) {
			this.skipSong.push(user);
			return this;
		}
		removeSkip() {
			this.skipSong.splice(0, this.skipSong.length);
		}
		// update bassboost filter
		setBassboost(value) {
			let valueEdited = 0;
			if (value == 0) {
				this.resetFilter();
				this.bassboost = 0;
				return this;
			}
			if (value > 0) {
				valueEdited = value / 50;
				this.setFilter({
					equalizer: [
						...Array(6)
							.fill(0)
							.map((n, i) => ({ band: i, gain: valueEdited })),
						...Array(9)
							.fill(0)
							.map((n, i) => ({ band: i + 6, gain: 0 })),
					],
				});
				this.bassboost = value;
				return this;
			} else {
				valueEdited = value / 10;
				this.setFilter({
					equalizer: [
						{ band: 0, gain: 0.6 },
						{ band: 1, gain: 0.67 },
						{ band: 2, gain: 0.67 },
						{ band: 3, gain: 0 },
						{ band: 4, gain: valueEdited }, //-0,5
						{ band: 5, gain: 0.15 },
						{ band: 6, gain: valueEdited }, //-0,45
						{ band: 7, gain: 0.23 },
						{ band: 8, gain: 0.35 },
						{ band: 9, gain: 0.45 },
						{ band: 10, gain: 0.55 },
						{ band: 11, gain: 0.6 },
						{ band: 12, gain: 0.55 },
						{ band: 13, gain: 0 },
					],
				});
				this.bassboost = value;
				return this;
			}
			return this;
		}

		// update nightcore filter
		setNightcore(value) {
			if (value) {
				this.setFilter({
					equalizer: [
						{
							band: 1,
							gain: 0.3,
						},
						{
							band: 0,
							gain: 0.3,
						},
					],
					timescale: {
						pitch: 1.2,
					},
					tremolo: {
						depth: 0.3,
						frequency: 14,
					},
				});
				this.nightcore = true;
				this.demon = false;
			} else {
				this.resetFilter();
				this.nightcore = false;
			}
			return this;
		}

		// update vaporwave filter
		// setVaporwave(value) {
		// 	if (value) {
		// 		this.setFilter({
		// 			equalizer: [
		// 				{ band: 1, gain: 0.3 },
		// 				{ band: 0, gain: 0.3 },
		// 			],
		// 			timescale: { pitch: 0.5 },
		// 			tremolo: { depth: 0.3, frequency: 14 },
		// 		});
		// 		this.vaporwave = true;
		// 	} else {
		// 		this.resetFilter();
		// 		this.vaporwave = false;
		// 	}
		// 	return this;
		// }

		setVaporwave(value) {
			if (value) {
				this.setFilter({
					equalizer: [
						{
							band: 2,
							gain: 0.2,
						},
						{
							band: 4,
							gain: 0.3,
						},
						{
							band: 6,
							Gain: 0.1,
						},
					],
					reverb: {
						wet: 0.5,
						dry: 0.5,
						roomSize: 0.5,
						damping: 0.5,
					},
					flanger: {
						depth: 0.5,
						frequency: 0.5,
						wet: 0.5,
						feedback: 0.5,
						spread: 180,
					},
					pitchShift: {
						semitones: -12,
					},
				});
				this.vaporwave = true;
				return this;
			}
			this.vaporwave = false;
			this.resetFilter();
			return this;
		}

		// set Demon filter
		setDemon(value) {
			if (value) {
				this.setFilter({
					equalizer: [
						{
							band: 1,
							gain: -0.6,
						},
						{
							band: 0,
							Gain: -0.6,
						},
						{
							band: 2,
							gain: -0.6,
						},
						{
							band: 3,
							Gain: -0.6,
						},
						{
							band: 4,
							Gain: -0.6,
						},
						{
							band: 5,
							Gain: -0.6,
						},
						{
							band: 6,
							Gain: -0.6,
						},
					],
					timescale: {
						pitch: 0.7,
					},
					tremolo: {
						depth: 0.3,
						frequency: 7,
					},
				});
				this.demon = true;
				this.nightcore = false;
			} else {
				this.resetFilter();
				this.demon = false;
			}
			return this;
		}

		// send lavalink the new filters
		setFilter(body = {}) {
			this.node.send({
				op: "filters",
				guildId: this.guild.id || this.guild,
				...body,
			});
			return this;
		}

		// setFilter(filter) {
		// 	this.filters = filter;
		// 	return this;
		// }

		// reset filters
		resetFilter() {
			this.speed = 1;
			this.node.send({
				op: "filters",
				guildId: this.guild.id || this.guild,
				...{},
			});
			return this;
		}

		resetFilter() {
			this.setFilter({});
			return this;
		}
		// Adds a song to previousTracks
		addPreviousSong(song) {
			this.previousTracks.push(song);
			return this;
		}

		// Change playback speed
		setSpeed(value) {
			this.speed = value;
			this.node.send({
				op: "filters",
				guildId: this.guild.id || this.guild,
				timescale: {
					speed: value,
				},
			});
			return this;
		}
	}
	return CustomPlayer;
});