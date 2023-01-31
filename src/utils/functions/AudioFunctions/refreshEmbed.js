const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = async (bot, settings) => {
	let components = [
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694402966519878")
				.setCustomId("play"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694406321963068")
				.setCustomId("skip"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694397337776171")
				.setCustomId("clear"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694398579277886")
				.setCustomId("loop"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694405218865172")
				.setCustomId("shuffle"),
		]),
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel("Add to Playlist")
				.setCustomId("atp"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Remove from Playlist")
				.setCustomId("rfp"),
		]),
	];

	let title = bot.translate(settings.Language, "musicoff:TITLE");
	let footer = {
		text: bot.translate(settings.Language, "musicoff:FOOTER"),
	};
	let musicembed = new EmbedBuilder()
		.setColor(bot.config.color)
		.setTitle(title)
		.setDescription(
			`[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`
		)
		.setFooter(footer)
		.setImage(bot.config.no_music);

	const channel = await bot.channels.fetch(settings.mChannelID);

	await channel
		.send({
			content: `‏‏‎ \n__**${bot.translate(
				settings.Language,
				"musicoff:QUEUE_LIST"
			)}:**__ \n${bot.translate(
				settings.Language,
				"musicoff:JOIN_AND_PLAY"
			)}`,
			embeds: [musicembed],
			components: components,
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"],
			},
		})
		.then(async (x) => {
			let newsettings = {
				mChannelEmbedID: x.id,
			};
			await bot.updateGuildSettings(settings.guildID, newsettings);
		});
};
