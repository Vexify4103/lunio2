// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");

module.exports = class Stop extends Command {
	constructor(bot) {
		super(bot, {
			name: "stop",
			helpPerms: "DJ",
			dirname: __dirname,
			description: "Stops the player and clear the queue.",
			slash: true,
			usage: "stop",
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
				bot.translate(settings.Language, "DJ/stop:EMBED_STOPPED")
			);

		player.queue.clear();
		player.stop();

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
		if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
		return;
	}
};
