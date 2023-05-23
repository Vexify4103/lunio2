const {
	EmbedBuilder,
	Channel,
	Permissions,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = async (bot, settings) => {
	const channelid = settings.mChannelID;
	const embedid = settings.mChannelEmbedID;

	const channel = await bot.channels.fetch(channelid);
	const embed = await channel.messages.fetch(embedid);

	let components = [
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694402966519878")
				.setCustomId("play")
				.setDisabled(false),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694406321963068")
				.setCustomId("skip")
				.setDisabled(false),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694397337776171")
				.setCustomId("clear")
				.setDisabled(false),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694398579277886")
				.setCustomId("loop")
				.setDisabled(false),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694405218865172")
				.setCustomId("shuffle")
				.setDisabled(false),
		]),
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel("Add to Playlist")
				.setCustomId("atp")
				.setDisabled(false),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Remove from Playlist")
				.setCustomId("rfp")
				.setDisabled(false),
		]),
	];
	embed.edit({
		components: components,
	});
};
