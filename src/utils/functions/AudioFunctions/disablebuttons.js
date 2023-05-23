const {
	EmbedBuilder,
	Channel,
	Permissions,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = async (bot, { mChannelID, mChannelEmbedID }) => {
	const channel = await bot.channels.fetch(mChannelID);
	const embed = await channel.messages.fetch(mChannelEmbedID);

	let components = [
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
		components: components,
	});
};
