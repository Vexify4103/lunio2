// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = class Requester extends Command {
	constructor(bot) {
		super(bot, {
			name: "requester",
			adminOnly: true,
			helpPerms: "Admin",
			dirname: __dirname,
			description:
				"Enables/disables if the requester is shown on each track.",
			cooldown: 2000,
			slash: true,
			usage: "requester <true/false>",
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "enable-requester",
					description:
						"Enables/disables if the requester is shown on each track.",
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
		const option = interaction.options.getString("enable-requester");

		let embedyes = new EmbedBuilder()
			.setColor(bot.config.colorTrue)
			.setDescription(
				`✅ **__${bot.translate(
					settings.Language,
					"Admin/requester:EMBED_REQUESTER_ENABLED"
				)}__**`
			);

		let embedno = new EmbedBuilder()
			.setColor(bot.config.colorWrong)
			.setDescription(
				`:x: **__${bot.translate(
					settings.Language,
					"Admin/requester:EMBED_REQUESTER_DISABLED"
				)}__**`
			);

		if (option === "on") {
			let newSettings = {
				Requester: true,
			};
			await bot.updateGuildSettings(guild.id, newSettings);

			return interaction.reply({
				embeds: [embedyes],
				ephemeral: true,
			});
		} else if (option === "off") {
			let newSettings = {
				Requester: false,
			};
			await bot.updateGuildSettings(guild.id, newSettings);

			return interaction.reply({
				embeds: [embedno],
				ephemeral: true,
			});
		}
	}
};
