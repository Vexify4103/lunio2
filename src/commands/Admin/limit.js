// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = class Limit extends Command {
	constructor(bot) {
		super(bot, {
			name: "limit",
			adminOnly: true,
			dirname: __dirname,
			description: "Show current set limits.",
			cooldown: 2000,
			helpPerms: "Admin",
			usage: "limit show",
			slash: true,
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "show",
					description: "Show current set limits.",
					type: 1,
				},
				{
					name: "song",
					description: "Set a song limit per user for non DJs.",
					type: 1,
					options: [
						{
							name: "song-amount",
							description:
								"The amount of songs a non DJ can have in the queue.",
							type: 4,
						},
					],
				},
				{
					name: "time",
					description: "Set a time limit per song for non DJs.",
					type: 1,
					options: [
						{
							name: "minutes",
							description:
								"The max. amount of minutes a song should have.",
							type: 4,
							required: true,
						},
						{
							name: "seconds",
							description:
								"The max amount of seconds the song should have. (59 is max)",
							type: 4,
							required: false,
						},
					],
				},
				{
					name: "song-reset",
					description: "Reset the song limit per user for non DJs.",
					type: 1,
				},
				{
					name: "time-reset",
					description: "Reset the time limit per song for non DJs.",
					type: 1,
				},
				{
					name: "reset",
					description: "Reset all limits.",
					type: 1,
				},
			],
			methods: [
				{
					name: "song",
					description: "Set a song limit per user for non DJs.",
					perms: "Admin",
				},
				{
					name: "time",
					description: "Set a time limit per song for non DJs.",
					perms: "Admin",
				},
				{
					name: "song-reset",
					description: "Reset the song limit per user for non DJs.",
					perms: "Admin",
				},
				{
					name: "time-reset",
					description: "Reset the time limit per song for non DJs.",
					perms: "Admin",
				},
				{
					name: "reset",
					description: "Reset all the limits.",
					perms: "Admin",
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const Sub = interaction.options.getSubcommand([
			"show",
			"song",
			"time",
			"song-reset",
			"time-reset",
			"reset",
		]);
		let songamount = interaction.options.getInteger("song-amount");
		let seconds = interaction.options.getInteger("seconds");
		let minutes = interaction.options.getInteger("minutes");
		let embed;
		let newSettings;

		switch (Sub) {
			case "show":
				let timeLimit;
				let songLimit;
				if (settings.SongTimeLimitMS > 0) {
					timeLimit = `${bot.getduration(settings.SongTimeLimitMS)}`;
				} else {
					timeLimit = `${bot.translate(
						settings.Language,
						"Admin/limit:NO_LIMIT_SET"
					)}`;
				}
				if (settings.SongUserLimit > 0) {
					songLimit = settings.SongUserLimit;
				} else {
					songLimit = bot.translate(
						settings.Language,
						"Admin/limit:NO_LIMIT_SET"
					);
				}
				let title = `${bot.translate(
					settings.Language,
					"Admin/limit:EMBED_LIMIT_TITLE"
				)}`;
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setTitle(title)
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_LIMIT_SUMMARY",
							{
								timeLimit: `${bot.codeBlock(timeLimit)}`,
								songLimit: `${bot.codeBlock(songLimit)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			case "song":
				if (songamount === 0) {
					embed = new EmbedBuilder()
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/limit:EMBED_MINIMUM_SONGS"
							)
						)
						.setColor(bot.config.colorOrange);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}
				newSettings = {
					SongUserLimit: songamount,
				};

				await bot.updateGuildSettings(guild.id, newSettings);

				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_MAXIMUMG_SONGS",
							{
								songamount: `${bot.codeBlock(songamount)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			case "time":
				if (!minutes || minutes === 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/limit:EMBED_MINIMUM_TIME"
							)
						);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				if (seconds > 59) seconds = 59;
				let time = `${minutes.toString()}:${seconds.toString()}`;
				const formatTime = bot.read24hFormat(time);

				newSettings = {
					SongTimeLimitMS: formatTime,
				};

				await bot.updateGuildSettings(guild.id, newSettings);

				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_MAXIMUM_TIME",
							{
								TIME: `${bot.codeBlock(
									bot.getduration(formatTime)
								)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			case "song-reset":
				if (settings.SongUserLimit === 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/limit:EMBED_NO_SONG_LIMIT"
							)
						);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				newSettings = {
					SongUserLimit: 0,
				};

				await bot.updateGuildSettings(guild.id, newSettings);

				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_REMOVED_SONG_LIMIT"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			case "time-reset":
				if (settings.SongTimeLimitMS === 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/limit:EMBED_NO_TIME_LIMIT"
							)
						);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}

				newSettings = {
					SongTimeLimitMS: 0,
				};

				await bot.updateGuildSettings(guild.id, newSettings);

				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_REMOVED_TIME_LIMIT"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			case "reset":
				let title2 = `${bot.translate(
					settings.Language,
					"Admin/limit:EMBED_LIMIT_TITLE"
				)}`;
				embed = new EmbedBuilder()
					.setColor(await bot.getColor(bot, guild.id))
					.setTitle(title2)
					.setDescription(
						bot.translate(
							settings.Language,
							"Admin/limit:EMBED_LIMIT_RESET",
							{
								SONGTIME: `${(settings.SongTimeLimitMS = 0
									? "There is no time limit for non DJs."
									: "There is no time limit on songs anymore.")}`,
								SONGAMOUNT: `${(settings.SongUserLimit = 0
									? "There is no song limit for non DJs."
									: "There is no song limit per user anymore.")}`,
							}
						)
					);

				newSettings = {
					SongTimeLimitMS: 0,
					SongUserLimit: 0,
				};

				await bot.updateGuildSettings(guild.id, settings);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			default:
				break;
		}
	}
};
