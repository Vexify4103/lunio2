// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = class Playlists extends Command {
	constructor(bot) {
		super(bot, {
			name: "playlists",
			adminOnly: true,
			helpPerms: "Admin",
			dirname: __dirname,
			description:
				"Enables/disables the possibility of queueing playlists.",
			cooldown: 2000,
			slash: true,
			usage: "playlists <true/false>",
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "enable-playlists",
					description:
						"Enables/disables the possibility of queueing playlists.",
					type: 3,
					required: true,
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
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const option = interaction.options.getString("enable-playlists");

		let embedyes = new EmbedBuilder()
			.setColor(bot.config.colorTrue)
			.setDescription(
				`✅ **__${bot.translate(
					settings.Language,
					"Admin/playlists:EMBED_PLAYLISTS_ENABLED"
				)}__**`
			);

		let embedno = new EmbedBuilder()
			.setColor(bot.config.colorWrong)
			.setDescription(
				`:x: **__${bot.translate(
					settings.Language,
					"Admin/playlists:EMBED_PLAYLISTS_DISABLED"
				)}__**`
			);

		if (option === "on") {
			let newSettings = {
				Playlists: true,
			};
			await bot.updateGuildSettings(guild.id, newSettings);

			return interaction.reply({
				embeds: [embedyes],
				ephemeral: true,
			});
		} else if (option === "off") {
			let newSettings = {
				Playlists: false,
			};
			await bot.updateGuildSettings(guild.id, newSettings);

			return interaction.reply({
				embeds: [embedno],
				ephemeral: true,
			});
		}
	}
};
