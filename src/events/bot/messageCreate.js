// Dependencies
const { MessageType } = require("discord-api-types/v9");
const {
		EmbedBuilder,
		MessageFlags,
		PermissionsBitField,
	} = require("discord.js"),
	Event = require("../../structures/Event");

const {
	setTimeoutId,
	clearTimeoutByMessageId,
} = require("../../utils/functions/UtilFunctios/timeoutManager");
module.exports = class Message extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, msg) {
		// Get settings
		let settings = await bot.getGuildData(bot, msg.guild.id);
		if (Object.keys(settings).length == 0) return;
		let usersettings = await bot.getUserData(bot, msg.author.id);
		if (Object.keys(usersettings).length == 0) return;
		const irc = await bot.isrequestchannel(msg.channel.id, settings);
		// Should not respond to bots
		if (irc && msg.author.bot && msg.author.id !== bot.user.id) {
			if (msg.deletable)
				await msg
					.delete()
					.catch((e) =>
						bot.logger.error(
							`Error deleting bot message not from Lunio: ${e}`
						)
					);
			return;
		}

		if (msg.author.bot && msg.author.id !== bot.user.id) return;
		// Should not respond to dms
		if (msg.channel.type === "DM") return;

		const guild = await bot.guilds.fetch(msg.guild.id);
		const member = await guild.members.fetch(msg.author.id);
		//Check if bot was mentioned
		if (
			[`<@${bot.user.id}>`, `<@!${bot.user.id}>`].find(
				(p) => msg.content == p
			)
		) {
			if (msg.deletable)
				await msg
					.delete()
					.catch((e) =>
						bot.logger.error(`Error deleting mention message.`)
					);
			let title = bot.translate(
				settings.Language,
				"messageCreate:MENTION_TITLE"
			);
			let footer = bot.translate(
				settings.Language,
				"messageCreate:MENTION_FOOTER",
				{
					CREATOR: "Vexify#7311",
					BOTNAME: "Hydra",
					CREATOR2: "Xavinlol#0001",
				}
			);
			let footerOptions = {
				text: footer,
			};
			if (settings.CustomChannel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.color)
					.setTitle(title)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MENTION_DESC_1",
							{
								SERVERID: `${bot.codeBlock(msg.guild.id)}`,
								CHANNELID: settings.mChannelID,
								SUPPLINK: bot.config.SupportServer.link,
								INVITELINK: bot.config.inviteLink,
							}
						)
					)
					.setFooter(footerOptions);

				return msg.channel.send({
					embeds: [embed],
				});
			} else {
				let embed = new EmbedBuilder()
					.setColor(bot.config.color)
					.setTitle(title)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MENTION_DESC_2",
							{
								SERVERID: `${bot.codeBlock(msg.guild.id)}`,
								SUPPLINK: bot.config.SupportServer.link,
								INVITELINK: bot.config.inviteLink,
							}
						)
					)
					.setFooter({
						text: "Developed by Vexify#7311 | Inspired by Hydra, created by Xavinlol#0001",
					});

				return msg.channel.send({
					embeds: [embed],
				});
			}
		}
		if (irc && !settings.mChannelUpdateInProgress) {
			const channel = await bot.channels.fetch(settings.mChannelID);
			//console.log(msg.mentions.users > 0) return console.log("user mentioned")
			const player = bot.manager.players.get(msg.guild.id);

			if (global.messageUpdateInProgress) return;
			if (msg.id === settings.mChannelEmbedID) return;
			// IF MSG IS FROM Lunio AND IS NORMAL MESSAGE => DELETE AFTER TIME
			if (
				msg.author.id === bot.user.id &&
				msg.type !== MessageType.ChatInputCommand
			) {
				return setTimeoutId(
					msg.id,
					setTimeout(async () => {
						await msg
							.delete()
							.catch((e) =>
								bot.logger.error(
									"Error deleting message from Lunio after time"
								)
							);
					}, bot.config.DeleteTimeout)
				);
			}

			// IF MSG IS FROM Lunio AND IS INTERACTION WITHOUT FLAGS => DELETE AFTER TIME
			if (
				msg.author.id === bot.user.id &&
				!msg.flags.has(MessageFlags.Ephemeral)
			) {
				return setTimeoutId(
					msg.id,
					setTimeout(async () => {
						await msg
							.delete()
							.catch((e) =>
								bot.logger.error(
									"Error deleting visible interaction from Lunio"
								)
							);
					}, bot.config.DeleteTimeout)
				);
			}

			// IF MSG IS FROM Lunio AND IS MESSAGE WITH FLAGS => DONT DELETE
			if (
				msg.author.id === bot.user.id &&
				msg.flags.has(MessageFlags.Ephemeral)
			)
				return;

			// If user mentioned
			if (msg.mentions.users.size > 0) {
				return await msg.delete().catch((e) => {
					bot.logger.error(
						`Error deleting mentioned user as song input: ${e}`
					);
				});
			}

			// IF MSG IS NOT FROM Lunio => DELETE
			if (msg.author.id !== bot.user.id) {
				await msg
					.delete()
					.catch((e) =>
						bot.logger.error(
							`Error deleting message not from Lunio: ${e}`
						)
					);
			}
			// CUSTOMCHANNEL PERMISSION CHECK
			if (
				!msg.guild.members.me.permissions.has(
					PermissionsBitField.Flags.ManageMessages
				)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MISSING_PERMISSION_SETUP",
							{
								PERMISSION: `${bot.codeBlock(
									"MANAGE_MESSAGES"
								)}`,
							}
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}

			// CHECK IF MEMBER IS IN VOICE
			if (!member.voice.channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:USER_NOT_VC"
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			// CHECK IF USER IS IN *SAME* VC
			if (player && member.voice.channel.id !== player.voiceChannel) {
				embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:PLAYING_DIFFERENT_VC"
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			// CHECK FOR RESTRICTED VC
			if (!bot.checkVC(member, settings)) {
				let str = [];
				settings.VCs.map((v) => {
					str.push(`<#${v}>`);
				});

				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						`${bot.translate(
							settings.Language,
							"Everyone/playlist:EMBED_NOT_ALLOWED_TO_JOIN"
						)} ${str.join("\n")}`
					);

				return channel.send({
					embeds: [embed],
				});
			}
			// CHECK IF USER IS BANNED FOR REQUESTING SONGS
			if (usersettings.guilds.includes(msg.guild.id)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:USER_BANNED"
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			// CHECK VIEW_CHANNEL PERMISSION
			if (
				!msg.member.voice.channel
					.permissionsFor(msg.guild.members.me)
					.has(PermissionsBitField.Flags.ViewChannel)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MISSING_READ_TEXT",
							{
								PERMISSION: `${bot.codeBlock(
									"Read Text Channels & See Voice Channels"
								)}`,
							}
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			// IF VOICE CHANNEL IS FULL
			if (
				msg.member.voice.channel.full &&
				!msg.member.voice.channel
					.permissionsFor(msg.guild.members.me)
					.has(PermissionsBitField.Flags.MoveMembers) &&
				(!msg.guild.members.me.voice.channel ||
					msg.guild.members.me.voice.channel.id !==
						msg.member.voice.channel.id)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:VC_ALREADY_FULL"
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}

			if (
				!msg.member.voice.channel
					.permissionsFor(msg.guild.members.me)
					.has(PermissionsBitField.Flags.Connect)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock("Connect")}`,
							}
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			if (
				!msg.member.voice.channel
					.permissionsFor(msg.guild.members.me)
					.has(PermissionsBitField.Flags.Connect)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock("Speak")}`,
							}
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}
			if (
				!msg.member.voice.channel
					.permissionsFor(msg.guild.members.me)
					.has(PermissionsBitField.Flags.UseVAD)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock(
									"Use Voice Activity"
								)}`,
							}
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}

			// CHECK FOR MUSICDJ
			if (!bot.checkDJ(member, settings)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"messageCreate:USER_NO_DJ"
						)
					);

				return channel.send({
					embeds: [embed],
				});
			}

			try {
				// await bot.refreshEmbed(bot, settings);
				global.messageUpdateInProgress = false;
				bot.logger.log("Searching for song using search function");
				global.messageUpdateInProgress = false;
				return await bot.search(
					bot,
					msg,
					msg.content,
					settings,
					member
				);
			} catch (error) {
				bot.logger.error(
					`running messageCreate: ${msg.guild.id} | ${error}`
				);
			}
		} else if (irc && settings.mChannelUpdateInProgress) {
			await bot.delay(bot, 10000);
			let channel = await bot.channels.fetch(settings.mChannelID);
			let messages = await channel.messages.fetch();
			settings = await bot.getGuildData(bot, msg.guild.id);
			try {
				let filter = messages.filter((m) => {
					return (
						m.id !== settings.mChannelBannerID &&
						m.id !== settings.mChannelEmbedID
					);
				});
				await channel.bulkDelete(filter, true);
			} catch (error) {
				bot.logger.error(
					`Error deleting messages after new embed was created: ${error}`
				);
			}
			return;
		}
	}
};