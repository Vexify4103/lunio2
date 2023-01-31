// Dependencies
const { paginate } = require("../../utils"),
	Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
const { getSong } = require("genius-lyrics-api");
const lyricsSearcher = require("lyrics-searcher");

module.exports = class Lyrics extends Command {
	constructor(bot) {
		super(bot, {
			name: "lyrics",
			helpPerms: "Everyone",
			dirname: __dirname,
			description: "Shows lyrics for the currently playing song.",
			cooldown: 2000,
			slash: true,
			usage: "lyrics",
			reqVote: true,
			reqplayer: false,
			reqvc: false,
			options: [
				{
					name: "song-title",
					description: "Shows lyrics for the provided song.",
					type: 3,
					required: false,
				},
				{
					name: "song-artist",
					description: "Helps searching the Lyrics for the Song",
					type: 3,
					required: false,
				},
			],
			methods: [
				{
					name: "<song title>",
					description: "Shows lyrics for the provided song.",
					perms: "Everyone",
				},
				{
					name: "<song title> + <song artist>",
					description: "Helps searching the Lyrics for the song.",
					perms: "Everyone",
				},
			],
		});
	}
	// Function for slash command
	async callback(bot, interaction, guild, args, settings) {
		const member = guild.members.cache.get(interaction.user.id);
		const song = interaction.options.getString("song-title");
		const artist = interaction.options.getString("song-artist");
		const player = bot.manager?.players.get(guild.id);

		let options;
		let embed;

		await interaction.deferReply({ ephemeral: true });

		// IF NO PLAYER AND NO USER INPUT RETURN ERROR
		if (!player && (!song || !artist)) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/lyrics:TITLE_AND_ARTIST_REQUIRED"
					)
				);

			return interaction.editReply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		// USERINPUT
		if (artist && song) {
			options = {
				title: song,
				artist: artist,
			};
			try {
				let lyrics = await this.searchLyrics(
					bot,
					guild,
					options,
					settings
				);

				if (Array.isArray(lyrics)) {
					paginate(bot, interaction, lyrics, member.id);
				} else {
					let footerOptions = {
						text: bot.translate(
							settings.Language,
							"Everyone/lyrics:LYRICS_BY"
						),
					};
					let embed = new EmbedBuilder()
						.setTitle(options.title)
						.setThumbnail(bot.config.googlelogo)
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(`${lyrics}`)
						.setFooter(footerOptions);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			} catch (error) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/lyrics:ERROR"
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
		}

		// IF PLAYER AND NO SONG OR NO TITLE
		if (player && (!song || !song)) {
			options = {
				title: player.queue.current.title,
				artist: player.queue.current.author,
			};

			try {
				let lyrics = await this.searchLyrics(
					bot,
					guild,
					options,
					settings
				);

				if (Array.isArray(lyrics)) {
					paginate(bot, interaction, lyrics, member.id);
				} else {
					let footerOptions = {
						text: bot.translate(
							settings.Language,
							"Everyone/lyrics:LYRICS_BY"
						),
					};
					let embed = new EmbedBuilder()
						.setTitle(options.title)
						.setThumbnail(bot.config.googlelogo)
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(`${lyrics}`)
						.setFooter(footerOptions);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			} catch (error) {
				console.log(error);
				embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"Everyone/lyrics:ERROR"
						)
					);

				return interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
		}
	}

	async searchLyrics(bot, guild, options, settings) {
		// search for and send lyrics
		let error = false;
		let info;
		try {
			info = await lyricsSearcher(options.artist, options.title).catch(
				() => {
					error = true;
				}
			);
		} catch (error) {
			error = true;
		}

		let footerOptions = {
			text: bot.translate(settings.Language, "Everyone/lyrics:LYRICS_BY"),
		};

		if (error) {
			var noly = bot.translate(
				settings.Language,
				"Everyone/lyrics:NO_LYRICS_FOUND"
			);
			return noly;
		}
		// create pages
		let pagesNum = Math.ceil(info.length / 3072);
		if (pagesNum === 0) pagesNum = 1;

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const embed = new EmbedBuilder()
				.setTitle(options.title)
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(info.substring(i * 3072, (i + 1) * 3072))
				.setThumbnail(bot.config.googlelogo)
				.setFooter(footerOptions);

			pages.push(embed);
		}

		return pages;
	}
};
