// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = class Eval extends Command {
	constructor(bot) {
		super(bot, {
			name: "eval",
			adminOnly: true,
			prv: true,
			userPermissions: ["ADMINISTRATOR"],
			description: "eval command",
			cooldown: 2000,
			slash: true,
			default_member_permissions: PermissionFlagsBits.ManageGuild,
			options: [
				{
					name: "code",
					description: "evaluate code",
					type: 3,
					required: true,
				},
			],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const code = interaction.options.getString("code");
		try {
			let result = eval(code);
			result = clean(result); // Clean the result before displaying it
			let resultString =
				result !== undefined
					? JSON.stringify(result, null, 2)
					: "Code executed successfully";

			const embed = new EmbedBuilder()
				.setTitle("Evaluated Code")
				.setDescription("```js\n" + resultString + "```")
				.setColor("#00FF00");

			await interaction.reply({ embeds: [embed], ephemeral: true });
		} catch (error) {
			const embed = new EmbedBuilder()
				.setTitle("Evaluation Error")
				.setDescription("```js\n" + error + "```")
				.setColor("#FF0000");

			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		function clean(text) {
			if (typeof text === "string")
				return text
					.replace(/`/g, "`" + String.fromCharCode(8203))
					.replace(/@/g, "@" + String.fromCharCode(8203));
			else return text;
		}
	}
};
