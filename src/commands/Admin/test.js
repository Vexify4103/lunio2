// Dependencies
const Command = require("../../structures/Command.js");
const {
	EmbedBuilder,
	Channel,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} = require("discord.js");

const lyricsSearcher = require("lyrics-searcher");

module.exports = class Test extends Command {
	constructor(bot) {
		super(bot, {
			name: "test",
			adminOnly: true,
			userPermissions: ["ADMINISTRATOR"],
			description: "TEST COMMAND",
			cooldown: 2000,
			slash: true,
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "test",
					description: "test",
					type: 3,
					required: true,
				},
				{
					name: "test2",
					description: "test2",
					type: 3,
					required: false,
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		// const channel = await bot.channels.fetch('866678034298568745');
		// const msg = await channel.messages.fetch('948647803213721632');

		const test = interaction.options.getString("test");
		const test2 = interaction.options.getString("test2");
		await interaction.deferReply({ ephemeral: true });

		lyricsSearcher(test, "")
			.then((lyrics) => {
				console.log(lyrics);
			})
			.catch((error) => {
				console.error(error);
			});

		let embed = new EmbedBuilder()
			.setColor(bot.config.colorOrange)
			.setDescription("TeStTT");

		return interaction.editReply({
			embeds: [embed],
		});
	}
};
