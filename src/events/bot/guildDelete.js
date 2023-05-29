// Dependencies
const { EmbedBuilder, MessageAttachment } = require("discord.js"),
	Event = require("../../structures/Event");

module.exports = class guildDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guild) {
		try {
			const expirationDate = new Date();
    		expirationDate.setDate(expirationDate.getDate() + 7);

			let newSettings = {
				expireDate: expirationDate
			}
			await bot.updateGuildSettings(guild.id, newSettings);
		} catch (error) {
			bot.logger.error(`${guild.id} error deleting mongodb files`)
		}
	}
};
