const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = async (bot, { mChannelID, mChannelEmbedID, Language }) => {
	const footer = {
		text: bot.translate(Language, "musicoff:FOOTER"),
	};
	const title = bot.translate(Language, "musicoff:TITLE");
	const MUSIC_OFF = new EmbedBuilder()
		.setColor(bot.config.color)
		.setTitle(title)
		.setDescription(
			`[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`
		)
		.setFooter(footer)
		.setImage(bot.config.no_music);

	const channel = await bot.channels.fetch(mChannelID);
	const embed = await channel.messages.fetch(mChannelEmbedID);

	const components = [
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694402966519878")
				.setCustomId("play")
				.setDisabled(true),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694406321963068")
				.setCustomId("skip")
				.setDisabled(true),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694397337776171")
				.setCustomId("clear")
				.setDisabled(true),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694398579277886")
				.setCustomId("loop")
				.setDisabled(true),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694405218865172")
				.setCustomId("shuffle")
				.setDisabled(true),
		]),
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel("Add to Playlist")
				.setCustomId("atp")
				.setDisabled(true),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Remove from Playlist")
				.setCustomId("rfp")
				.setDisabled(true),
		]),
	];

	embed.edit({
		content: `‏‏‎ \n__**${bot.translate(
			Language,
			"musicoff:QUEUE_LIST"
		)}:**__\n${bot.translate(Language, "musicoff:JOIN_AND_PLAY")}`,
		embeds: [MUSIC_OFF],
		components: components,
		allowedMentions: {
			repliedUser: false,
			parse: ["everyone"],
		},
	});
};