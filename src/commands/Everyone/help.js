// Dependencies
const {
	MessageEmbed
} = require('discord.js');
const Command = require('../../structures/Command.js');

module.exports = class Help extends Command {
	constructor(bot) {
		super(bot, {
			name: 'help',
			helpPerms: "Everyone",
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Shows the help menu.',
			usage: 'help',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'command',
				description: 'Name of command to look up.',
				type: 3,
				required: false,
			}],
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const embed = await this.createEmbed(bot, guild, interaction.options.getString('command'), settings);
		return interaction.reply({
			embeds: [embed],
			ephemeral: true
		})
	}

	// create Help embed
	async createEmbed(bot, guild, command, settings) {
		const authorOptions = {
			name: "Help Command",
			iconURL: bot.user.displayAvatarURL({
				format: 'png'
			})
		}
		const footerOptions = {
			text: bot.translate(settings.Language, 'Everyone/help:FOOTER_DESC', settings.Language),
		}
		if (!command) {
			// Show default help page
			const embed = new MessageEmbed()
				.setColor(bot.config.color)
				.setAuthor(authorOptions)
				.setFooter(footerOptions)

			const categories = bot.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
			categories
				.sort((a, b) => a.category - b.category)
				.forEach(category => {
					const commands = bot.commands
						.filter(c => c.help.category === category)
						.sort((a, b) => a.help.name - b.help.name)
						.map(c => `\`${c.help.name}\``).join(', ');
					embed.addField(`${category} commands`, commands);
				});
			return embed;
		} else if (command) {
			// Check if arg is command
			if (bot.commands.get(command)) {
				// arg was a command
				const cmd = bot.commands.get(command);

				let flags = cmd.help.flags
				// Check if the command is allowed on the server
				if (settings.plugins.includes(cmd.help.category)) {
					const embed = new MessageEmbed()
						.setColor(bot.config.color)
						.setAuthor(authorOptions)
						.addField(`/${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:USAGE`)}`, `${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:DESC`)}\n\`[${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:PERMS`)}]\`\n‏‏‎ `)

					if (cmd.help.methods.length > 0) {
						for (let i = 0; i < cmd.help.methods.length; i++) {
							embed.addField(`/${cmd.help.name} ${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:METHOD_NAME_${i + 1}`)}`, `${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:METHOD_DESC_${i + 1}`)}\n${bot.codeBlock(`[${bot.translate(settings.Language, `${cmd.help.category}/${cmd.help.name}:METHOD_PERMS_${i + 1}`)}]`)}\n‏‏‎ `)
						}
					}
					return embed;
				} else {
					return;
				}
			} else {
				const embed = new MessageEmbed()
					.setColor(bot.config.color)
					.setAuthor(authorOptions)
					.setFooter(footerOptions)

				const categories = bot.commands.map(c => c.help.category).filter((v, i, a) => settings.plugins.includes(v) && a.indexOf(v) === i);
				categories
					.sort((a, b) => a.category - b.category)
					.forEach(category => {
						const commands = bot.commands
							.filter(c => c.help.category === category)
							.sort((a, b) => a.help.name - b.help.name)
							.map(c => `\`${c.help.name}\``).join(', ');
						embed.addField(`${category} commands`, commands);
					});
				return embed;
			}
		} else {
			return;
		}
	}
};