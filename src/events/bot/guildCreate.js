// Dependencies
const {
		EmbedBuilder,
		ChannelType,
		PermissionsBitField,
	} = require("discord.js"),
	Event = require("../../structures/Event");
const { GuildSchema } = require("../../database/models/");

module.exports = class GuildCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guild) {
		// Check if the guild document already exists in MongoDB
		const existingGuild = await GuildSchema.findOne({ guildID: guild.id });
		const newSettings = {
			expireDate: null,
		};
		if (existingGuild) {
			// The guild document already exists, update the expiration date to infinite
			await bot.updateGuildSettings(guild.id, newSettings);
		}
		let channelToSend;

		guild.channels.cache.forEach((channel) => {
			if (
				channel.type === ChannelType.GuildText &&
				!channelToSend &&
				channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.SendMessages)
			)
				channelToSend = channel;
		});
		if (!channelToSend) return;

		const embed = new EmbedBuilder()
			.setTitle("Listen to music with passion - Lunio")
			.setDescription(
				`Thank you for inviting me!\n\nTo get started, join a voice channel and ${bot.codeBlock(
					"/play"
				)} a song.\nIf you prefer to have a unique songrequest channel, type ${bot.codeBlock(
					"/setup"
				)}\nTo get the list of all commands type ${bot.codeBlock(
					"/help"
				)}\n\nIf you need support feel free to join the [Support Server](${
					bot.config.SupportServer.link
				}).`
			)
			.setColor(bot.config.color);
		channelToSend.send({
			embeds: [embed],
		});
	}
};
