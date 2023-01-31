// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: "bassboost",
			adminOnly: true,
			premiumOnly: true,
			dirname: __dirname,
			description: "Show the current bassboost level.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "bassboost <value>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "value",
					description:
						"Sets the bassboost from -5 (max treble) to 5 (max bass).",
					type: 10,
					required: false,
					min_value: -5,
					max_value: 5,
					// minValue: -5,
					// maxValue: 5,
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		const value = interaction.options.getNumber("value");
		let BassBoost = player.bassboost;
		let embed;

		//console.log(player);

		// if no option: tell bassboost status:
		if (value === null) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/bassboost:EMBED_DISPLAY_BASSBOOSTLEVEL",
						{
							VALUE: BassBoost,
						}
					)
				);
		} else {
			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/bassboost:EMBED_SET_NEW_BASSBOOSTLEVEL",
						{
							VALUE: value,
						}
					)
				);

			player.setBassboost(value);
		}

		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
};
