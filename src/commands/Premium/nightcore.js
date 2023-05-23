// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: "nightcore",
			premiumOnly: true,
			dirname: __dirname,
			description: "Toggles the nightcore filter.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "nightcore <on/off>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "toggle",
					description: "Toggles the nightcore filter.",
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
		const nightcore = player?.nightcore;
		let embed;

		if (choice === "on") {
			if (nightcore) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/nightcore:EMBED_DISPLAY_NIGHTCORESTATUS",
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
			player.setNightcore(true);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/nightcore:EMBED_DISPLAY_NEW_NIGHTCORESTATUS",
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
			if (!nightcore) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/nightcore:EMBED_DISPLAY_NIGHTCORESTATUS",
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
			player.setNightcore(false);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/nightcore:EMBED_DISPLAY_NEW_NIGHTCORESTATUS",
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
