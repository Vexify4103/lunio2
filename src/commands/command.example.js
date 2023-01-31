// Dependencies
const { version } = require("discord.js"),
	{ Embed } = require("../../utils"),
	{
		time: { getReadableTime },
	} = require("../../utils"),
	Command = require("../../structures/Command.js");

module.exports = class About extends Command {
	constructor(bot) {
		super(bot, {
			name: "",
			dirname: __dirname,
			aliases: [""],
			botPermissions: [""],
			description: "",
			usage: "",
			cooldown: 2000,
			slash: true,
		});
	}
	// Function for slash command
	async callback(bot, interaction, guild) {}
};
