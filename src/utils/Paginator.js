// variables
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
} = require("discord.js");
timeout = 118000; // TEST: 10000 // REAL: 118000

module.exports = async (bot, type, pages, userID) => {
	let page = 0;

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("1")
			.setLabel("⏮")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("2")
			.setLabel("◀️")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("3")
			.setLabel("▶️")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("4")
			.setLabel("⏭")
			.setStyle(ButtonStyle.Secondary)
	);

	let curPage;
	if (type instanceof CommandInteraction) {
		if (type.replied || type.deferred) {
			curPage = await type.editReply({
				embeds: [pages[page]],
				ephemeral: true,
				components: [row],
				fetchReply: true,
			});
		} else {
			curPage = await type.reply({
				embeds: [pages[page]],
				ephemeral: true,
				components: [row],
				fetchReply: true,
			});
		}
	} else {
		if (type.replied || type.deferred) {
			curPage = await type.editReply({
				embeds: [pages[page]],
				ephemeral: true,
				components: [row],
				fetchReply: true,
			});
		} else {
			curPage = await type.send({
				embeds: [pages[page]],
				ephemeral: true,
				components: [row],
				fetchReply: true,
			});
		}
	}
	const buttonCollector = await curPage.createMessageComponentCollector({
		componentType: ComponentType.Button,
	});

	// find out what emoji was reacted on to update pages
	buttonCollector.on("collect", (i) => {
		if (i.user.id !== userID) return;
		switch (Number(i.customId)) {
			case 1:
				page = 0;
				break;
			case 2:
				page = page > 0 ? --page : 0;
				break;
			case 3:
				page = page + 1 < pages.length ? ++page : pages.length - 1;
				break;
			case 4:
				page = pages.length - 1;
				break;
			default:
				break;
		}
		i.update({
			embeds: [pages[page]],
			ephemeral: true,
		});
	});

	// when timer runs out remove all reactions to show end of pageinator
	buttonCollector.on("end", async () => {
		return interaction.editReply({
			embeds: [pages[page]],
			components: [],
		});
	});
	return curPage;
};
