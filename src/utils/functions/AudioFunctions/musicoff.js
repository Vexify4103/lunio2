const { MessageEmbed } = require("discord.js");

module.exports = async (bot, settings) => {
	const channelid = settings.mChannelID
	const embedid = settings.mChannelEmbedID
     let footer = {
		text: bot.translate(settings.Language, 'musicoff:FOOTER')
     }
	let title = bot.translate(settings.Language, 'musicoff:TITLE')
	const MUSIC_OFF = new MessageEmbed()
		.setColor(bot.config.color)
		.setTitle(title)
		.setDescription(`[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`)
		.setFooter(footer)
		.setImage(bot.config.no_music)

	const channel = await bot.channels.fetch(channelid);
	const embed = await channel.messages.fetch(embedid);

	embed.edit({
		content: `‏‏‎ \n__**${bot.translate(settings.Language, 'musicoff:QUEUE_LIST')}:**__\n${bot.translate(settings.Language, 'musicoff:JOIN_AND_PLAY')}`,
		embeds: [MUSIC_OFF],
		allowedMentions: {
			repliedUser: false,
			parse: ["everyone"]
		}
	})
};