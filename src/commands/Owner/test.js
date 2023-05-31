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

module.exports = class Test extends Command {
	constructor(bot) {
		super(bot, {
			name: "test",
			adminOnly: true,
			prv: true,
			userPermissions: ["ADMINISTRATOR"],
			description: "test command",
			cooldown: 2000,
			slash: true,
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			// options: [
			// 	{
			// 		name: "code",
			// 		description: "evaluate code",
			// 		type: 3,
			// 		required: true,
			// 	},
			// ],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		
	}
};

// return interaction.reply({
// 	embeds: [embed],
// 	ephemeral: true,
// });
