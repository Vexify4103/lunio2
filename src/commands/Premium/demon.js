// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: "demon",
			adminOnly: true,
			premiumOnly: true,
			dirname: __dirname,
			description: "Toggles the demon filter.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "demon <on/off>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "toggle",
					description: "Toggles the demon filter.",
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
		const demon = player?.demon;
		let embed;

		if (choice === "on") {
			if (demon) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/demon:EMBED_DISPLAY_DEMONSTATUS",
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
			player.setDemon(true);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/demon:EMBED_DISPLAY_NEW_DEMONSTATUS",
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
			if (!demon) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/demon:EMBED_DISPLAY_DEMONSTATUS",
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
			player.setDemon(false);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/demon:EMBED_DISPLAY_NEW_DEMONSTATUS",
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
