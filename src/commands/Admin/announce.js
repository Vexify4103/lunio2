// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = class Playlists extends Command {
	constructor(bot) {
		super(bot, {
			name: "announce",
			adminOnly: true,
			helpPerms: "Admin",
			dirname: __dirname,
			description: "Toggle sending of now playing messages on/off",
			slash: true,
			usage: "announce",
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "delete",
					description:
						"Toggle deletion of now playing messages on/off",
					type: 3,
					required: false,
					choices: [
						{
							name: "on",
							value: "on",
						},
						{
							name: "off",
							value: "off",
						},
					],
				},
			],
			methods: [
				{
					name: "delete",
					description:
						"Toggle deletion of now playing messages on/off",
					perms: "Admin",
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		let deltrue = new EmbedBuilder()
			.setColor(bot.config.colorTrue)
			.setDescription(
				`✅ **__${bot.translate(
					settings.Language,
					"Admin/announce:EMBED_DEL_TRUE"
				)}__**`
			);

		let delfalse = new EmbedBuilder()
			.setColor(bot.config.colorWrong)
			.setDescription(
				`:x: **__${bot.translate(
					settings.Language,
					"Admin/announce:EMBED_DEL_FALSE"
				)}__**`
			);

		let announcetrue = new EmbedBuilder()
			.setColor(bot.config.colorTrue)
			.setDescription(
				`✅ **__${bot.translate(
					settings.Language,
					"Admin/announce:EMBED_ANNOUNCE_TRUE"
				)}__**`
			);

		let announcefalse = new EmbedBuilder()
			.setColor(bot.config.colorWrong)
			.setDescription(
				`:x: **__${bot.translate(
					settings.Language,
					"Admin/announce:EMBED_ANNOUNCE_FALSE"
				)}__**`
			);

		const del = interaction.options.getString("delete");

		if (del === null) {
			if (settings.Announce) {
				let newSettings = {
					Announce: false,
				};
				await bot.updateGuildSettings(guild.id, newSettings);

				return interaction.reply({
					embeds: [announcefalse],
					ephemeral: true,
				});
			} else {
				let newSettings = {
					Announce: true,
				};
				await bot.updateGuildSettings(guild.id, newSettings);

				return interaction.reply({
					embeds: [announcetrue],
					ephemeral: true,
				});
			}
		} else {
			// IF SECOND OPTION
			if (del === "on") {
				let newSettings = {
					DelAnnounce: true,
				};
				await bot.updateGuildSettings(guild.id, newSettings);

				return interaction.reply({
					embeds: [deltrue],
					ephemeral: true,
				});
			} else if (del === "off") {
				let newSettings = {
					DelAnnounce: false,
				};
				await bot.updateGuildSettings(guild.id, newSettings);

				return interaction.reply({
					embeds: [delfalse],
					ephemeral: true,
				});
			}
		}
	}
};
