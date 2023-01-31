// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");

module.exports = class Move extends Command {
	constructor(bot) {
		super(bot, {
			name: "move",
			helpPerms: "DJ",
			dirname: __dirname,
			description: "Move the selected song to the provided position.",
			slash: true,
			usage: "move <from> <to>",
			music: true,
			reqplayer: true,
			reqvc: true,
			options: [
				{
					name: "from",
					description:
						'The initial position of the song. (if no "to" position, it will always move to no. 1)',
					type: 4,
					required: true,
				},
				{
					name: "to",
					description: "The new position of the song.",
					type: 4,
					required: false,
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		let pos1 = interaction.options.getInteger("from");
		let pos2 = interaction.options.getInteger("to");
		let embed;

		if (player.queue.size <= 0) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.transalte(settings.Language, "DJ/move:EMBED_NO_QUEUE")
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		if (pos1 === 0) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.translate(
						settings.Language,
						"DJ/move:EMBED_PLAYING_THIS"
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		if (pos1 > player.queue.size) pos1 = player.queue.size;
		if (!pos2) {
			const song = player.queue[pos1 - 1];
			player.queue.splice(pos1 - 1, 1);
			player.queue.splice(0, 0, song);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"DJ/move:EMBED_MOVED_SONG_POS1"
					)
				);

			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			if (settings.CustomChannel)
				await bot.musicembed(bot, player, settings);
			return;
		} else if (pos2) {
			if (pos2 === 0) pos2 = 1;
			if (pos2 > player.queue.size) pos2 = player.queue.size - 1;
			const song = player.queue[pos1 - 1];
			player.queue.splice(pos1 - 1, 1);
			player.queue.splice(pos2 - 1, 0, song);

			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"DJ/move:EMBED_MOVED_SONG_POSX",
						{
							pos: pos2,
						}
					)
				);

			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			if (settings.CustomChannel)
				await bot.musicembed(bot, player, settings);
			return;
		}
	}
};
