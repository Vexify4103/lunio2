// Dependencies
const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class slashCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, interaction) {
		const guildId = interaction.guildId;
		const guild = await bot.guilds.fetch(guildId);

		let cmd = bot.commands.get(interaction.commandName);
		let channel = await bot.channels.fetch(interaction.channelId);
		let member = await guild.members.fetch(interaction.user.id);
		const player = bot.manager.players.get(interaction.guildId);

		let settings = await bot.getGuildData(bot, guildId);
		if (Object.keys(settings).length == 0) return;
		let usersettings = await bot.getUserData(bot, interaction.user.id);
		if (Object.keys(usersettings).length == 0) return;

		if (!channel || !member)
			return bot.logger.error(
				"Error running / command cause channel or member are undefined."
			);

		// check user permissions
		if (
			cmd.conf.adminOnly &&
			!member.permissions.has(PermissionsBitField.Flags.Administrator)
		) {
			let embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					`You need admin permissions to use this command.`
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		let neededPermissions = [];
		cmd.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) {
				neededPermissions.push(perm);
			}
		});

		// Display missing user permissions
		if (neededPermissions.length > 0) {
			let embed = new EmbedBuilder()
				.setColor(bot.config.colorWrong)
				.setDescription(
					`You need ${bot.codeBlock(
						neededPermissions.join("\n")
					)} permission/s for that command.`
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		// If interaction was ran outside of CustomChannel
		if (
			settings.CustomChannel &&
			cmd.conf.music &&
			interaction.channelId !== settings.mChannelID
		) {
			let embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					`This command is restricted to <#${settings.mChannelID}>.`
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		// CHECK PERMISSIONS
		// SETUP PERMISSIONS CHECK
		const setupPerms = [
			PermissionsBitField.Flags.ManageChannels,
			PermissionsBitField.Flags.ViewChannel,
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.ManageMessages,
			PermissionsBitField.Flags.EmbedLinks,
			PermissionsBitField.Flags.AttachFiles,
			PermissionsBitField.Flags.ReadMessageHistory,
			PermissionsBitField.Flags.UseExternalEmojis,
			PermissionsBitField.Flags.Connect,
			PermissionsBitField.Flags.Speak,
			PermissionsBitField.Flags.UseVAD,
		];
		const setupPermsReadable = [
			"Manage Channels",
			"Read Text Channels & See Voice Channels",
			"Send Messages",
			"Manage Messages",
			"Embed Links",
			"Attach Files",
			"Read History",
			"Use External Emojis",
			"Connect",
			"Speak",
			"Use Voice Activity",
		];
		if (
			cmd.help.name === "setup" &&
			!guild.members.me.permissions.has(setupPerms)
		) {
			let neededPerms = [];
			for (
				let i = 0;
				i < setupPerms.length && setupPermsReadable.length;
				i++
			) {
				const perm = setupPerms[i];
				const readable = setupPermsReadable[i];
				neededPerms.push(
					guild.members.me.permissions.has(perm)
						? `✅ ${readable}`
						: `❌ ${readable}`
				);
			}
			return interaction.reply({
				content: `**__${bot.translate(
					settings.Language,
					"slashCreate:REQUIRED_PERMS_SETUP"
				)}:__**\n${neededPerms.join("\n")}`,
				ephemeral: true,
			});
		}
		// CUSTOMCHANNEL PERMISSION CHECK
		if (interaction.channelId === settings.mChannelID) {
			if (
				!guild.members.me.permissions.has(
					PermissionsBitField.Flags.ManageMessages
				)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:MISSING_PERMISSION_SETUP",
							{
								PERMISSION: `${bot.codeBlock(
									"ManageMessages"
								)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
		}

		// IF COMMAND REQUIRES VOICE CHANNEL
		if (cmd.conf.reqvc) {
			if (!member.voice.channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:USER_NOT_VC"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			if (player && member.voice.channel.id !== player.voiceChannel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:PLAYING_DIFFERENT_VC"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
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

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
		}

		// If user is banned from using commands
		if (usersettings.guilds.includes(interaction.guildId)) {
			let embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(settings.Language, "slashCreate:USER_BANNED")
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}

		// CHECK PREMIUM EXPIRE DATES FOR USER
		if (usersettings.expireDate !== 0) {
			if (usersettings.expireDate < new Date()) {
				let newUserSettings = {
					premium: false,
					premiumUses: 0,
					expireDate: 0,
				};
				await bot.updateUserSettings(interaction.user, newUserSettings);
			}
		}
		// CHECK PREMIUM EXPIRE DATES FOR GUILD
		if (settings.expireDate !== 0) {
			if (settings.expireDate < new Date()) {
				let newGuildSettings = {
					premium: false,
					expireDate: 0,
				};
				await bot.updateGuildSettings(guildId, newGuildSettings);
			}
		}
		// Check if user can use premium commands
		if (
			cmd.conf.premiumOnly &&
			!(
				settings.premium ||
				settings.permpremium ||
				usersettings.premium ||
				usersettings.permpremium
			)
		) {
			let embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"slashCreate:COMMAND_PREMIUM"
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		// Check if user can run voterequireded commands
		//if (cmd.conf.reqVote && !(settings.permvote || hasVoted)) {

		//	let voteonly = new EmbedBuilder()
		//		.setColor(bot.config.colorOrange)
		//		.setDescription(`This command requires you to vote.\n[Click here](${bot.config.voteLink}) to vote and use this command for the next 12 hours.`)

		//	return await bot.send(interaction, {
		//		embeds: [embed],
		//		ephemeral: true
		//	})
		//}

		// IF COMMAND IS IN PREMIUM CATEGORY
		if (cmd.conf.location === "./commands/Premium") {
			// IF NO PREMIUM DETECTED
			if (
				!(
					settings.premium ||
					settings.permpremium ||
					usersettings.premium ||
					usersettings.permpremium
				)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:COMMAND_PREMIUM"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			if (
				(cmd.help.name === "247" || cmd.help.name === "autoplay") &&
				!member.permissions.has(PermissionsBitField.Flags.Administrator)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:USER_NOT_ADMIN"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			if (!bot.checkDJ(member, settings)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:USER_NO_DJ"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// IF PLAYER REQUIRED
			if (cmd.conf.reqplayer) {
				if (!player) {
					let embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"slashCreate:BOT_NOT_PLAYING"
							)
						);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			}
		}
		// IF COMMAND IS MUSIC COMMAND
		if (cmd.conf.music) {
			// IF USER IS NOT IN A VOICE CHANNEL
			if (!member.voice.channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:USER_NOT_VC"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// IF BOT CANNOT SEE VOICE CHANNEL
			if (
				!member.voice.channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.ViewChannel)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:MISSING_READ_TEXT",
							{
								PERMISSION: `${bot.codeBlock(
									"Read Text Channels & See Voice Channels"
								)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// IF VOICE CHANNEL IS FULL
			if (
				member.voice.channel.full &&
				!member.voice.channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.MoveMembers) &&
				(!guild.members.me.voice.channel ||
					guild.members.me.voice.channel.id !==
						member.voice.channel.id)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:VC_ALREADY_FULL"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}

			if (
				!member.voice.channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.Connect)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock("Connect")}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			if (
				!member.voice.channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.Speak)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock("Speak")}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			if (
				!member.voice.channel
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.UseVAD)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorWrong)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:MISSING_PERM",
							{
								PERMISSION: `${bot.codeBlock(
									"Use Voice Activity"
								)}`,
							}
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}

			// CHECK FOR DJ ROLE
			// || settings.MusicDJ && cmd.help.name === 'playlist'
			if (
				cmd.conf.location === "./commands/DJ" &&
				!bot.checkDJ(member, settings)
			) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(
						bot.translate(
							settings.Language,
							"slashCreate:USER_NO_DJ"
						)
					);

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			// IF COMMAND REQUIRES ACTIVE PLAYER
			if (cmd.conf.reqplayer) {
				if (!player || !player.queue.current) {
					let embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"slashCreate:BOT_NOT_PLAYING"
							)
						);

					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				}
			}
		}
		try {
			await cmd.callback(
				bot,
				interaction,
				guild,
				interaction.options,
				settings
			);
		} catch (error) {
			console.trace(error);
			bot.logger.error(`running slashCreate: ${guild.id} | ${error}`);
			if (bot.config.debug) return console.log(error);
		}
		return undefined;
	}
};
