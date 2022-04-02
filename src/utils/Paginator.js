// variables
const {
	MessageActionRow,
	MessageButton,
} = require('discord.js'),
	timeout = 118000; // TEST: 10000 // REAL: 118000

module.exports = async (bot, interaction, pages, userID) => {
	let page = 0;

	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
			.setCustomId('1')
			.setLabel('⏮')
			.setStyle('SECONDARY'),
			new MessageButton()
			.setCustomId('2')
			.setLabel('◀️')
			.setStyle('SECONDARY'),
			new MessageButton()
			.setCustomId('3')
			.setLabel('▶️')
			.setStyle('SECONDARY'),
			new MessageButton()
			.setCustomId('4')
			.setLabel('⏭')
			.setStyle('SECONDARY'),
		);

	let curPage;
	if (interaction.replied) {
		curPage = await interaction.editReply({
			embeds: [pages[page]],
			components: [row],
			fetchReply: true,
			ephemeral: true
		});
	} else {
		curPage = await interaction.reply({
			embeds: [pages[page]],
			components: [row],
			fetchReply: true,
			ephemeral: true
		});
	}

	const buttonCollector = await curPage.createMessageComponentCollector({
		componentType: 'BUTTON',
		time: timeout
	});

	// find out what emoji was reacted on to update pages
	buttonCollector.on('collect', (i) => {
		if (i.user.id !== userID) return;
		switch (Number(i.customId)) {
			case 1:
				page = 0;
				break;
			case 2:
				page = page > 0 ? --page : 0;
				break;
			case 3:
				page = page + 1 < pages.length ? ++page : (pages.length - 1);
				break;
			case 4:
				page = pages.length - 1;
				break;
			default:
				break;
		}
		i.update({
			embeds: [pages[page]],
			ephemeral: true
		});
	});
	// when timer runs out remove all reactions to show end of pageinator
	try {
		buttonCollector.on('end', async () => {
			return interaction.editReply({
				embeds: [pages[page]],
				components: []
			})

		})
	} catch (error) {
		console.log(`Error removing buttons from lyrics embed: ${error}`)
	}
	return curPage;
};