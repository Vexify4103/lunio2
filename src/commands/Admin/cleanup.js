// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = class Cleanup extends Command {
	constructor(bot) {
		super(bot, {
			name: "cleanup",
			adminOnly: true,
			dirname: __dirname,
			description: "Clear command and bot messages.",
			cooldown: 2000,
			helpPerms: "Admin",
			usage: "cleanup",
			slash: true,
			default_member_permissions: PermissionFlagsBits.ManageGuild,
		});
	}
	async callback(bot, interaction, guild, args, settings) {
		const member = interaction.options.getMember("user");
		// member.user = CustomUser data
		// interaction.user = CustomUser data from author
		let embed;

		let i = [];
		let title = bot.translate(
			settings.Language,
			"Admin/cleanup:EMBED_LOADING_TITLE"
		);
		embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(
				bot.translate(
					settings.Language,
					"Admin/cleanup:EMBED_LOADING_DESC"
				)
			)
			.setColor(await bot.getColor(bot, guild.id));

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});

		const channel = await guild.channels.fetch(interaction.channel.id);
		const messages = await channel.messages.fetch();

		try {
			if (channel.id === settings.mChannelID) {
				let filter = messages.filter((m) => {
					return (
						m.id !== settings.mChannelBannerID &&
						m.id !== settings.mChannelEmbedID
					);
				});
				const { size } = await channel.bulkDelete(filter, true);

				if (size === 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/cleanup:EMBED_NO_MESSAGES"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				} else {
					embed = new EmbedBuilder()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/cleanup:EMBED_SUCCESSFULL_DELETED",
								{
									SIZE: `${bot.codeBlock(size)}`,
								}
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			} else {
				let filter = messages.filter((m) => {
					return m.author.id === bot.user.id;
				});
				const { size } = await channel.bulkDelete(filter, true);

				if (size === 0) {
					embed = new EmbedBuilder()
						.setColor(bot.config.colorOrange)
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/cleanup:EMBED_NO_MESSAGES"
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				} else {
					embed = new EmbedBuilder()
						.setColor(await bot.getColor(bot, guild.id))
						.setDescription(
							bot.translate(
								settings.Language,
								"Admin/cleanup:EMBED_SUCCESSFULL_DELETED",
								{
									SIZE: `${bot.codeBlock(size)}`,
								}
							)
						);

					return interaction.editReply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			}
		} catch (error) {
			bot.logger.error(`Error deleting messages: ${error}`);

			embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					bot.translate(
						settings.Language,
						"Admin/cleanup:EMBED_ERROR_DELETING"
					)
				);

			return interaction.editReply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
};
