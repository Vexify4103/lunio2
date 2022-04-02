// Dependencies
const {
	MessageEmbed,
	Interaction
} = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class Message extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, msg) {

		// Should not respond to bots
		if (msg.author.bot && msg.author.id !== bot.user.id) return;
		// Should not respond to dms
		if (msg.channel.type === 'DM') return;
		// Get server settings
		let settings = await bot.getGuildData(bot, msg.guild.id)
		if (Object.keys(settings).length == 0) return;
		let usersettings = await bot.getUserData(bot, msg.author.id)
		if (Object.keys(usersettings).length == 0) return;
		const guild = await bot.guilds.fetch(msg.guild.id);
		const member = await guild.members.fetch(msg.author.id);
		//Check if bot was mentioned
		if ([`<@${bot.user.id}>`, `<@!${bot.user.id}>`].find(p => msg.content == p)) {
			if (msg.deletable) {
				try {
					msg.delete();
				} catch (error) {
					bot.logger.error('Error deleting mention message.')
				}
			}
			let title = bot.translate(settings.Language, 'messageCreate:MENTION_TITLE')
			let footer = bot.translate(settings.Language, 'messageCreate:MENTION_FOOTER', {
				CREATOR: 'Vexify#7311',
				BOTNAME: 'Hydra',
				CREATOR2: 'Xavinlol#0001'
			})
			if (settings.CustomChannel) {
				let embed = new MessageEmbed()
					.setColor(bot.config.color)
					.setTitle(title)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MENTION_DESC_1', {
						SERVERID: msg.guild.id,
						CHANNELID: settings.mChannelID,
						SUPPLINK: bot.config.SupportServer.link,
						INVITELINK: bot.config.inviteLink
					}))
					.setFooter(footer)

				return msg.channel.send({
					embeds: [embed]
				})
			} else {
				let embed = new MessageEmbed()
					.setColor(bot.config.color)
					.setTitle(title)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MENTION_DESC_2', {
						SERVERID: msg.guild.id,
						SUPPLINK: bot.config.SupportServer.link,
						INVITELINK: bot.config.inviteLink
					}))
					.setFooter({
						text: "Developed by Vexify#7311 | Inspired by Hydra, created by Xavinlol#0001"
					})

				return msg.channel.send({
					embeds: [embed]
				})
			}
		}

		const irc = await bot.isrequestchannel(msg.channel.id, settings);
		if (irc) {
			const player = bot.manager.players.get(msg.guild.id);
			// IF MSG IS FOR SEARCH COMMAND AND SO LENGTH IS SMALLER THEN 2
			if (msg.content.length <= 2 && msg.author.id !== bot.user.id) return msg.delete();
			if (msg.content.toLowerCase() === 'cancel') return;
			// IF MSG IS FROM VOID AND IS NORMAL MESSAGE => DELETE AFTER TIME
			if ((msg.author.id === bot.user.id) && (msg.type !== 'APPLICATION_COMMAND')) {
				try {
					return setTimeout(() => msg.delete(), bot.config.DeleteTimeout);
				} catch (error) {
					bot.logger.error(`Error deleting message from void after time: ${error}`)
				}
			}


			// IF MSG IS FROM VOID AND IS INTERACTION WITHOUT FLAGS => DELETE AFTER TIME
			if ((msg.author.id === bot.user.id) && (!msg.flags.has('EPHEMERAL'))) {
				try {
					return setTimeout(() => msg.delete(), bot.config.DeleteTimeout);
				} catch (error) {
					bot.logger.error(`Error deleting visible interaction from void: ${error}`)
				}
			}

			// IF MSG IS FROM VOID AND IS INTERACTION WITH FLAGS => DONT DELETE 
			if ((msg.author.id === bot.user.id) && msg.flags.has('EPHEMERAL')) return;

			// IF MSG IS NOT FROM VOID => DELETE
			if (msg.author.id !== bot.user.id) {
				try {
					if (msg?.deletable) msg.delete()
				} catch (error) {
					bot.logger.error(`Error deleting message not from void: ${error}`)
				}
			}
			let channel = await bot.channels.fetch(settings.mChannelID);

			// CUSTOMCHANNEL PERMISSION CHECK
			if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MISSING_PERMISSION_SETUP', {
						PERMISSION: 'MANAGE_MESSAGES'
					}))

				return channel.send({
					embeds: [embed],
				})
			}
			
			// CHECK IF MEMBER IS IN VOICE
			if (!member.voice.channel) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'messageCreate:USER_NOT_VC'))

				return channel.send({
					embeds: [embed],
				})
			}
			// CHECK IF USER IS IN *SAME* VC
			if (player && (member.voice.channel.id !== player.voiceChannel)) {
				embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'messageCreate:PLAYING_DIFFERENT_VC'))

				return channel.send({
					embeds: [embed],
				})
			}
			// CHECK FOR RESTRICTED VC
			if (!bot.checkVC(member, settings)) {
				let str = [];
				settings.VCs.map(v => {
					str.push(`<#${v}>`)
				});

				let embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(`${bot.translate(settings.Language, 'Everyone/playlist:EMBED_NOT_ALLOWED_TO_JOIN')} ${str.join("\n")}`)

				return channel.send({
					embeds: [embed],
				})
			}
			// CHECK IF USER IS BANNED FOR REQUESTING SONGS
			if (usersettings.guilds.includes(msg.guild.id)) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'messageCreate:USER_BANNED'))

				return channel.send({
					embeds: [embed],
				})
			}
			// CHECK VIEW_CHANNEL PERMISSION
			if (!msg.member.voice.channel.permissionsFor(msg.guild.me).has('VIEW_CHANNEL')) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MISSING_READ_TEXT', {
						PERMISSION: "Read Text Channels & See Voice Channels"
					}))

				return channel.send({
					embeds: [embed]
				})
			}
			// IF VOICE CHANNEL IS FULL
			if (msg.member.voice.channel.full && !msg.member.voice.channel.permissionsFor(msg.guild.me).has('MOVE_MEMBERS') && (!msg.guild.me.voice.channel || (msg.guild.me.voice.channel.id !== msg.member.voice.channel.id))) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:VC_ALREADY_FULL'))

				return channel.send({
					embeds: [embed]
				})
			}
			
			if (!msg.member.voice.channel.permissionsFor(msg.guild.me).has('CONNECT')) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MISSING_PERM', {
						PERMISSION: 'Connect'
					}))
					
				return channel.send({
					embeds: [embed]
				})
			}
			if (!msg.member.voice.channel.permissionsFor(msg.guild.me).has('SPEAK')) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MISSING_PERM', {
						PERMISSION: 'Speak'
					}))	
					
				return channel.send({
					embeds: [embed]
				})
			}
			if (!msg.member.voice.channel.permissionsFor(msg.guild.me).has('USE_VAD')) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorWrong)
					.setDescription(bot.translate(settings.Language, 'messageCreate:MISSING_PERM', {
						PERMISSION: 'Use Voice Activity'
					}))
					
				return channel.send({
					embeds: [embed]
				})
			}

			// CHECK FOR MUSICDJ
			if (!bot.checkDJ(member, settings)) {
				let embed = new MessageEmbed()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'messageCreate:USER_NO_DJ'))

				return channel.send({
					embeds: [embed],
				})
			}


			try {
				return await bot.search(bot, msg, msg.content, settings, member); 
			} catch (error) {
				bot.logger.error(`running messageCreate: ${msg.guild.id} | ${error}`)
			}
		} else {
			return;
		}
	}
};