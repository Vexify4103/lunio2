// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
	constructor(bot) {
		super(bot, {
			name: "speed",
			premiumOnly: true,
			dirname: __dirname,
			description: "Speeds up the player.",
			cooldown: 2000,
			helpPerms: "Premium, DJ",
			usage: "speed <speed factor>",
			slash: true,
			reqvc: true,
			reqplayer: true,
			options: [
				{
					name: "value",
					description: "Sets the speed up to 2x. Default at 1x. Under is slower, higher is faster.",
					type: 10,
					required: false,
					min_value: 0,
					max_value: 2,
					// minValue: -5,
					// maxValue: 5,
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		const value = interaction.options.getNumber("value");

		let embed;

		//console.log(player);

		// if no option: tell bassboost status:
		if (!value === null) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/speed:EMBED_DISPLAY_SPEEDLEVEL",
						{
							VALUE: player.speed,
						}
					)
				);
		} else {
			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Premium/speed:EMBED_SET_NEW_SPEEDLEVEL",
						{
							VALUE: value,
						}
					)
				);

			player.setSpeed(value);
		}

		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
};
