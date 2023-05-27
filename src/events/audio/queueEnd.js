const { EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");
const chalk = require("chalk");
const moment = require("moment");

class QueueEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		const timestamp = `[${moment().format("HH:mm:ss")}]:`;
		const content = `${player.guild} finished track: ${track.author} ${track.title}`;
		console.log(`${timestamp} ${chalk.bgYellow("FINISHED")} ${content} `);
		
		const videoID = track.uri.substring(track.uri.indexOf("=") + 1);
		let randomIndex;
		let searchURI;

		do {
			randomIndex = Math.floor(Math.random() * 23) + 2;
			searchURI = `https://www.youtube.com/watch?v=${videoID}&list=RD${videoID}&index=${randomIndex}`;
		} while (track.uri.includes(searchURI));

		const settings = await bot.getGuildData(bot, player.guild);
		let message;

		const channel = await bot.channels.fetch(player.textChannel);
		if (settings.CustomChannel) {
			message = await channel.messages.fetch(settings.mChannelEmbedID);
		}

		if (!player.autoplay) {
			if (!player.twentyFourSeven) {
				player.timeout = setTimeout(async () => {
					const embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"misc:INACTIVE_TIMEOUT",
								{
									URL: bot.config.premiumLink,
								}
							)
						);

					if (settings.CustomChannel) {
						await message.reply({ embeds: [embed] });
					} else {
						await channel.send({ embeds: [embed] });
					}

					player.destroy();
				}, bot.config.LeaveTimeout);
				return;
			}
			bot.logger.log(
				`Guild ${player.guild} is in 24/7 mode. Staying in voice channel`
			);
		} else {
			if (!player.twentyFourSeven) {
				player.timeout = setTimeout(async () => {
					const embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"misc:INACTIVE_TIMEOUT",
								{
									URL: bot.config.premiumLink,
								}
							)
						);

					if (settings.CustomChannel) {
						await message.reply({ embeds: [embed] });
					} else {
						await channel.send({ embeds: [embed] });
					}

					player.destroy();
				}, bot.config.LeaveTimeout);
			}

			let res;
			try {
				res = await bot.manager.search(searchURI, track.requester);
				res = await bot.replaceTitle(bot, res);
				//console.log(res);

				if (res.loadType === "LOAD_FAILED") {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}

				// Shuffle the tracks array
				const shuffledTracks = res.tracks.sort(
					() => Math.random() - 0.5
				);

				// Find a track that is different from the original track
				const foundTrack = shuffledTracks.find(
					(track2) => track2.uri !== track.uri
				);

				switch (res.loadType) {
					case "NO_MATCHES":
						const nores = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(
								bot.translate(
									settings.Language,
									"Everyone/play:NO_MATCHES"
								)
							);

						if (settings.CustomChannel) {
							await message.reply({ embeds: [nores] });
						} else {
							await channel.send({ embeds: [nores] });
						}
						break;
					case "PLAYLIST_LOADED":
					case "TRACK_LOADED":
					case "SEARCH_RESULT":
						const timestamp = `[${moment().format("HH:mm:ss")}]:`;
						const content = `${player.guild} added track: ${track.author} - ${track.title}`;
						console.log(
							`${timestamp} ${chalk.bgCyan(
								"AUTOPLAY"
							)} ${content}`
						);
						player.queue.add(foundTrack, track.requester);
						if (
							!player.playing &&
							!player.paused &&
							!player.queue.size
						) {
							await player.play();
						}
						if (settings.CustomChannel) {
							await bot.musicembed(bot, player, settings);
						}
						break;
				}
			} catch (error) {
				console.log(error);
				const embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(settings.Language, "misc:AUTOPLAY_ERROR")
					);

				if (settings.CustomChannel) {
					await message.reply({ embeds: [embed] });
				} else {
					await channel.send({ embeds: [embed] });
				}
			}
		}
	}
}

module.exports = QueueEnd;
