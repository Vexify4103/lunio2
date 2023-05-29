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
			options: [
				{
					name: "song-number",
					description:
						"Shows the detail of a specific song in the queue.",
					type: 4,
					required: false,
				},
			],
			methods: [
				{
					name: "song-number",
					description:
						"Shows the detail of a specific song in the queue.",
					perms: "Everyone",
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		let songNumber = interaction.options.getInteger("song-number");
		const player = bot.manager.players.get(guild.id);
		let embed;

		if (songNumber > 1) {
			if (songNumber > player.queue.size)
				songNumber = player.queue.size || 0;
			songNumber - 1;
			let footer;
			if (songNumber === 0) {
				footer = {
					text: `[${bot.getduration(
						player.position
					)}/${bot.getduration(player.queue.current.duration)}]`,
				};
			} else {
				footer = {
					text: `[00:00/${bot.getduration(
						player.queue[songNumber - 1].duration
					)}]`,
				};
			}
			embed = new EmbedBuilder()
				.setTitle(
					`${player.queue[songNumber - 1]?.author} - ${
						player.queue[songNumber - 1]?.title
					}`
				)
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/songinfo:EMBED",
						{
							REQUESTER: `<@${
								player?.queue[songNumber - 1]?.requester.id ||
								player.queue.current.requester.id
							}>`,
							PROGRESSBAR: bot.progressBar(
								player?.queue[songNumber - 1]?.duration ||
									player.queue.current.duration,
								player.position || 0
							),
						}
					)
				)
				.setFooter(footer);

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			embed = new EmbedBuilder()
				.setTitle(
					`${player.queue.current.author} - ${player.queue.current.title}`
				)
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/songinfo:EMBED",
						{
							REQUESTER: `<@${player.queue.current.requester.id}>`,
							PROGRESSBAR: bot.progressBar(
								player.queue.current.duration,
								player.position || 0
							),
						}
					)
				)
				.setFooter({
					text: `[${
						bot.getduration(player.position || 0) || "00:00"
					}/${
						bot.getduration(player.queue.current.duration) ||
						"00:00"
					}]`,
				});

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
};
