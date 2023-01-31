// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");

module.exports = class Clear extends Command {
	constructor(bot) {
		super(bot, {
			name: "clear",
			helpPerms: "DJ",
			dirname: __dirname,
			description: "Clears the current queue.",
			slash: true,
			usage: "clear",
			music: true,
			reqplayer: true,
			reqvc: true,
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		let embed;

		if (player.queue.size <= 0) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.translate(settings.Language, "DJ/clear:EMBED_NO_QUEUE")
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		embed = new EmbedBuilder()
			.setColor(await bot.getColor(bot, guild.id))
			.setDescription(
				bot.translate(settings.Language, "DJ/clear:EMBED_QUEUE_CLEARED")
			);

		player.queue.clear();
		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
		if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
		return;
	}
};
