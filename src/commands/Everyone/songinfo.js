// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");

module.exports = class Songinfo extends Command {
	constructor(bot) {
		super(bot, {
			name: "songinfo",
			helpPerms: "Everyone",
			dirname: __dirname,
			description: "Shows details of the song currently being played.",
			slash: true,
			usage: "songinfo",
			music: true,
			reqplayer: true,
			reqvc: false,
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		let embed;

		embed = new EmbedBuilder()
			.setTitle(
				`${player.queue.current.author} - ${player.queue.current.title}`
			)
			.setColor(await bot.getColor(bot, guild.id))
			.setDescription(
				bot.translate(settings.Language, "Everyone/songinfo:EMBED", {
					REQUESTER: `<@${player.queue.current.requester.id}>`,
					PROGRESSBAR: bot.progressBar(
						player.queue.current.duration,
						player.position || 0
					),
				})
			)
			.setFooter({
				text: `[${bot.getduration(player.position || 0) || "00:00"}/${
					bot.getduration(player.queue.current.duration) || "00:00"
				}]`,
			});

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
};
