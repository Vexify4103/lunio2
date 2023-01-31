// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Autoplay extends Command {
	constructor(bot) {
		super(bot, {
			name: "autoplay",
			adminOnly: true,
			premiumOnly: true,
			dirname: __dirname,
			description:
				"Toggle the bot to continuously queue up recommended tracks.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "autoplay <on/off>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "toggle",
					description:
						"Toggle the bot to continuously queue up recommended tracks.",
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
		const TwentyFourSeven = player?.twentyFourSeven;
		let embed;

		if (choice === "on") {
			if (player.autoplay) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/autoplay:EMBED_AUTOPLAY_ALREADY_TOGGLE",
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
			player.autoplay = true;

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/autoplay:EMBED_AUTOPLAY_ACTIVATED"
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		if (choice === "off") {
			if (!player.autoplay) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"Premium/autoplay:EMBED_AUTOPLAY_ALREADY_TOGGLE",
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
			player.autoplay = false;

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/autoplay:EMBED_AUTOPLAY_DEACTIVATED"
					)
				);

			if (!player.queue.current) player.destroy();
			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
};
