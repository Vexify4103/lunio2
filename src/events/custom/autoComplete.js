// Dependencies
const axios = require("axios"),
	{ parseVideo } = require("../../structures"),
	rfc3986EncodeURIComponent = (str) =>
		encodeURIComponent(str).replace(/[!'()*]/g, escape),
	Event = require("../../structures/Event");

/**
 * Click button event
 * @event Egglord#autoComplete
 * @extends {Event}
 */
class AutoComplete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {AutocompleteInteraction} button The button that was pressed
	 * @readonly
	 */
	async run(bot, interaction) {
		switch (interaction.commandName) {
			case "play":
			case "search": {
				// Get current input and make sure it's not 0
				const searchQuery = interaction.options.getFocused(true).value;
				if (searchQuery.length == 0) return interaction.respond([]);

				let fetched = false;
				const res = await axios.get(
					`https://www.youtube.com/results?q=${rfc3986EncodeURIComponent(
						searchQuery
					)}&hl=en`
				);
				let html = res.data;

				// try to parse html
				try {
					const data = html
						.split("ytInitialData = '")[1]
						?.split("';</script>")[0];
					html = data.replace(/\\x([0-9A-F]{2})/gi, (...items) =>
						String.fromCharCode(parseInt(items[1], 16))
					);
					html = html.replaceAll('\\\\"', "");
					html = JSON.parse(html);
				} catch (e) {
					null;
				}

				let videos;
				if (
					html?.contents?.sectionListRenderer?.contents?.length > 0 &&
					html.contents.sectionListRenderer.contents[0]
						?.itemSectionRenderer?.contents?.length > 0
				) {
					videos =
						html.contents.sectionListRenderer.contents[0]
							.itemSectionRenderer.contents;
					fetched = true;
				}

				// backup/ alternative parsing
				if (!fetched) {
					try {
						videos = JSON.parse(
							html
								.split('{"itemSectionRenderer":{"contents":')
								[
									html.split(
										'{"itemSectionRenderer":{"contents":'
									).length - 1
								].split(',"continuations":[{')[0]
						);
						fetched = true;
					} catch (e) {
						null;
					}
				}
				if (!fetched) {
					try {
						videos = JSON.parse(
							html
								.split('{"itemSectionRenderer":')
								[
									html.split('{"itemSectionRenderer":')
										.length - 1
								].split('},{"continuationItemRenderer":{')[0]
						).contents;
						fetched = true;
					} catch (e) {
						null;
					}
				}

				const results = [];
				if (!fetched) return interaction.respond(results);
				for (const video of videos) {
					// Only get 5 video suggestions
					if (results.length >= 5) break;
					const parsed = parseVideo(bot, video);
					if (parsed) results.push(parsed);
				}

				interaction.respond(
					results.map((video) => ({
						name: video.title,
						value:
							interaction.commandName == "play"
								? video.url
								: video.title,
					}))
				);
				break;
			}
			case "help": {
				const input = interaction.options.getFocused(true).value,
					commands = [...bot.commands.keys()]
						.filter((i) =>
							i.toLowerCase().startsWith(input.toLowerCase())
						)
						.slice(0, 10);

				interaction.respond(
					commands.map((i) => ({ name: i, value: i }))
				);
				break;
			}
			case "remove":
			case "move": {
				const player = bot.manager?.players?.get(interaction.guildId);
				const input = Number(
					interaction.options.getFocused(true).value
				);

				if (!player || player.queue.size <= 0) {
					return interaction.respond([]);
				}

				if (isNaN(input) || input > player.queue.size || input < 0) {
					return interaction.respond([]);
				}
				const selectedNumber = parseInt(input, 10) - 1; // subtract 1 to match the 0-indexed array

				let responseArray = [];

				const start = selectedNumber - 2 >= 0 ? selectedNumber - 2 : 0;
				const end =
					selectedNumber + 3 <= player.queue.length
						? selectedNumber + 3
						: player.queue.length;

				for (let i = start; i < end; i++) {
					responseArray.push({
						name: `${i + 1}: ${player.queue[i].title}`,
						value: selectedNumber <= 0 ? 1 : selectedNumber + 1,
					});
				}
				//console.log(selectedNumber)
				return interaction.respond(responseArray);
			}
			case "playlist": {
				// console.log(interaction.options._subcommand)
				const { PlaylistSchema } = require("../../database/models");
				const userSettings = await bot.getUserData(
					bot,
					interaction.user.id
				);
				/**
				 * {
				 *	_id: new ObjectId("636735c42e200cc0a02f4efe"),
				 *	userID: '337568120028004362',
				 *	userNAME: 'Vexify#0001',
				 *	Language: 'en-US',
				 *	__v: 0,
				 *	defaultPlaylist: 'songs',
				 *	expireDate: 1670300357200,
				 *	guilds: [],
				 *	hasVoted: false,
				 *	permpremium: true,
				 *	premium: true,
				 *	premiumUses: 99,
				 *	votedTime: 0
				 *	}
				 * console.log(userSettings);
				 */

				const playlistArray = await PlaylistSchema.find({
					creator: interaction.user.id,
				}).exec();

				let defaultSettings = {
					name: bot.config.defaultUserSettings.defaultPlaylist,
					creator: interaction.user.id,
				};

				let focusedOption = "";
				let responseArray = [];

				switch (interaction.options._subcommand) {
					case "default":
					case "show":
					case "delete":
					case "load":
					case "save":
					case "share":
						if (playlistArray.length <= 0) {
							await bot.createPlaylist(bot, defaultSettings);
							return interaction.respond([
								{
									name: defaultSettings.name,
									value: defaultSettings.name,
								},
							]);
						}
						for (let i = 0; i < playlistArray.length; i++) {
							const playlist = playlistArray[i];
							responseArray.push({
								name: playlist.name,
								value: playlist.name,
							});
						}
						return interaction.respond(responseArray);
					case "song-save": {
						focusedOption =
							interaction.options.getFocused(true).name;

						if (focusedOption == "playlist-name") {
							if (playlistArray.length <= 0) {
								await bot.createPlaylist(bot, defaultSettings);
								return interaction.respond([
									{
										name: defaultSettings.name,
										value: defaultSettings.name,
									},
								]);
							}
							for (let i = 0; i < playlistArray.length; i++) {
								const playlist = playlistArray[i];
								responseArray.push({
									name: playlist.name,
									value: playlist.name,
								});
							}
							return interaction.respond(responseArray);
						} else {
							// Get current input and make sure it's not 0
							const searchQuery =
								interaction.options.getFocused(true).value;
							if (searchQuery.length == 0)
								return interaction.respond([]);

							let fetched = false;
							const res = await axios.get(
								`https://www.youtube.com/results?q=${rfc3986EncodeURIComponent(
									searchQuery
								)}&hl=en`
							);
							let html = res.data;

							// try to parse html
							try {
								const data = html
									.split("ytInitialData = '")[1]
									?.split("';</script>")[0];
								html = data.replace(
									/\\x([0-9A-F]{2})/gi,
									(...items) =>
										String.fromCharCode(
											parseInt(items[1], 16)
										)
								);
								html = html.replaceAll('\\\\"', "");
								html = JSON.parse(html);
							} catch (e) {
								null;
							}

							let videos;
							if (
								html?.contents?.sectionListRenderer?.contents
									?.length > 0 &&
								html.contents.sectionListRenderer.contents[0]
									?.itemSectionRenderer?.contents?.length > 0
							) {
								videos =
									html.contents.sectionListRenderer
										.contents[0].itemSectionRenderer
										.contents;
								fetched = true;
							}

							// backup/ alternative parsing
							if (!fetched) {
								try {
									videos = JSON.parse(
										html
											.split(
												'{"itemSectionRenderer":{"contents":'
											)
											[
												html.split(
													'{"itemSectionRenderer":{"contents":'
												).length - 1
											].split(',"continuations":[{')[0]
									);
									fetched = true;
								} catch (e) {
									null;
								}
							}
							if (!fetched) {
								try {
									videos = JSON.parse(
										html
											.split('{"itemSectionRenderer":')
											[
												html.split(
													'{"itemSectionRenderer":'
												).length - 1
											].split(
												'},{"continuationItemRenderer":{'
											)[0]
									).contents;
									fetched = true;
								} catch (e) {
									null;
								}
							}

							const results = [];
							if (!fetched) return interaction.respond(results);
							for (const video of videos) {
								// Only get 5 video suggestions
								if (results.length >= 5) break;
								const parsed = parseVideo(bot, video);
								if (parsed) results.push(parsed);
							}

							return interaction.respond(
								results.map((video) => ({
									name: video.title,
									value:
										interaction.commandName == "playlist"
											? video.url
											: video.title,
								}))
							);
						}
					}
					case "song-delete":
						focusedOption =
							interaction.options.getFocused(true).name;

						if (focusedOption != "playlist-name") return;

						if (playlistArray.length <= 0) {
							await bot.createPlaylist(bot, defaultSettings);
							return interaction.respond([
								{
									name: defaultSettings.name,
									value: defaultSettings.name,
								},
							]);
						}
						for (let i = 0; i < playlistArray.length; i++) {
							const playlist = playlistArray[i];
							responseArray.push({
								name: playlist.name,
								value: playlist.name,
							});
						}
						return interaction.respond(responseArray);
				}
				return interaction.respond([]);
			}
		}
	}
}

module.exports = AutoComplete;
