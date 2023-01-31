// Dependencies
const { InteractionType } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class Interaction extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, interaction) {
		// The interaction is a slash command
		if (interaction.isChatInputCommand())
			return bot.emit("slashCreate", interaction);

		// The interaction is a button
		if (interaction.isButton()) return bot.emit("clickButton", interaction);

		// the interaction is an autocomplete field
		if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
			return bot.emit("autoComplete", interaction);
	}
};
