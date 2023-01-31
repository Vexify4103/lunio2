// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: "vaporwave",
			adminOnly: true,
			premiumOnly: true,
			dirname: __dirname,
			description: "Toggles the vaporwave filter.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "vaporwave <on/off>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "toggle",
					description: "Toggles the vaporwave filter.",
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
		const player = bot.manager.players.get(guild.id);
		const choice = interaction.options.getString("toggle");
		const vaporwave = player?.vaporwave;
		let embed;

		if (choice === "on") {
			if (player.vaporwave) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/vaporwave:EMBED_DISPLAY_VAPORWAVESTATUS",
							{
								TOGGLE: `${bot.codeBlock(choice)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			player.setVaporwave(true);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/vaporwave:EMBED_DISPLAY_NEW_VAPORWAVESTATUS",
						{
							TOGGLE: `${bot.codeBlock(choice)}`,
						}
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		if (choice === "off") {
			if (!player.vaporwave) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/vaporwave:EMBED_DISPLAY_VAPORWAVESTATUS",
							{
								TOGGLE: `${bot.codeBlock(choice)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			player.setVaporwave(false);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/vaporwave:EMBED_DISPLAY_NEW_VAPORWAVESTATUS",
						{
							TOGGLE: `${bot.codeBlock(choice)}`,
						}
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
};
