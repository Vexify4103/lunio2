// Dependencies
const Command = require("../../structures/Command.js");
const { paginate } = require("../../utils");
const { EmbedBuilder } = require("discord.js");

module.exports = class Voteskip extends Command {
	constructor(bot) {
		super(bot, {
			name: "voteskip",
			helpPerms: "Everyone",
			dirname: __dirname,
			description: "Lets you vote for skipping the current track.",
			slash: true,
			usage: "voteskip",
			music: true,
			reqplayer: true,
			reqvc: true,
		});
	}

	// Function for message command
	// Function for slash command
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		let embed;

		// skipSong = ['USEERID1', 'USERID2']
		if (player.skipSong.includes(interaction.user.id)) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/voteskip:EMBED_ALREADY_VOTED"
					)
				);

			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		player.voteSkip(interaction.user.id);

		let userInVC = interaction.member.voice.channel.members.size - 1;
		let required = Math.ceil(userInVC / 2);
		if (player.skipSong.length >= required) {
			await player.stop();
			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/voteskip:EMBED_SKIPPED_TRACK"
					)
				);

			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/voteskip:EMBED_VOTING_REQUIRED",
						{
							VOTES: `${bot.codeBlock(player.skipSong.length)}`,
							REQUIRED: `${bot.codeBlock(required)}`,
						}
					)
				);

			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
};
