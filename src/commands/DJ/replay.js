// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");

module.exports = class Replay extends Command {
	constructor(bot) {
		super(bot, {
			name: "replay",
			helpPerms: "DJ",
			dirname: __dirname,
			description: "Replay the current song.",
			slash: true,
			usage: "replay",
			music: true,
			reqplayer: true,
			reqvc: true,
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		let embed;

		embed = new EmbedBuilder()
			.setColor(await bot.getColor(bot, guild.id))
			.setDescription(
				bot.translate(
					settings.Language,
					"DJ/replay:EMBED_REPLAYING_SONG"
				)
			);

		player.seek(0);

		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
};
