const { MessageEmbed } = require("discord.js");
const getduration = require('./getduration');

module.exports = async (bot, player, settings) => {
	const channelid = settings.mChannelID
	const embedid = settings.mChannelEmbedID
	const requester = settings.Requester

	if (!player) return await bot.musicoff(bot, settings);

	//console.log(player.queue)
	const queue = player.queue
	const track = player.queue.current
	const multiple = 15;
	const page = 1
	const end = page * multiple;
	const start = end - multiple;
	const tracksnormal = queue.slice(start, end);
	const tracks = tracksnormal.reverse()
	const queueLength = queue.length
	let queueArray;

	let thumbnail = bot.config.music_playing_banner;


	let footer = {
		text: bot.translate(settings.Language, 'musicembed:FOOTER', {
			QUEUEAMOUNT: `${queue.length || 0}`,
			PLAYERVOLUME: player.volume,
			PLAYERREPEAT: `${player.queueRepeat ? `| ${bot.translate(settings.Language, 'musicembed:LOOP_QUEUE')}` : player.trackRepeat ? `| ${bot.translate(settings.Language, 'musicembed:LOOP_SONG')}` : ""}`,
			PAUSED: `${player.paused ? `| ${bot.translate(settings.Language, 'musicembed:SONG_PAUSED')}` : ""}`
		})
	}
	// text: `${queue.length || 0} Songs in queue | Volume: ${player.volume}% ${player.queueRepeat ? "| Loop: queue" : player.trackRepeat ? "| Loop: song" : ""} ${player.paused ? "| Song paused" : ""}`
	
	const channel = await bot.channels.fetch(channelid);
	const guild = await bot.guilds.fetch(player.guild);
	
	if (!channel.permissionsFor(guild.me).has('')) {
		const ERROR = new MessageEmbed()
			.setDescription(`I need the permission: ${bot.codeBlock('Read History')} in here which is required.`)
			.setColor(bot.config.colorWrong)

		return channel.send({
			embeds: [embed]
		})
	}

	const embed = await channel.messages.fetch(embedid);
	let color = guild.me.displayHexColor;

	if (color === '#000000') {
		color = bot.config.color;
	}

     let Author = {
          name: `[${getduration(track.duration)}] - ${track.title}`,
          iconURL: bot.user.displayAvatarURL({ format: 'png' }),
          url:  track.uri
     }
	const MUSIC = new MessageEmbed()
		.setAuthor(Author)
		.setImage(thumbnail)
		.setColor(color)
		.setFooter(footer)

	if (requester) {
		MUSIC.setDescription(bot.translate(settings.Language, 'musicembed:REQUESTED_BY', {
			REQUESTER: track.requester
		}))
		queueArray = tracks.map((_, i, trackM) => `${trackM.length - i}. ${trackM[i].author} - ${trackM[i].title} [${getduration(trackM[i].duration)}] ~ <@${trackM[i].requester.id}>`).join("\n")
	} else {
		queueArray = tracks.map((_, i, trackM) => `${trackM.length - i}. ${trackM[i].author} - ${trackM[i].title} [${getduration(trackM[i].duration)}]`).join("\n")
	}

	if (queueLength > multiple) {
		return embed.edit({
			content: `‏‏‎‏‏‎ \n__**${bot.translate(settings.Language, 'musicembed:QUEUE_LIST')}:**__\n\n${bot.translate(settings.Language, 'musicembed:AND_MORE', { AMOUNT: queueLength - multiple })}\n${queueArray}`,
			embeds: [MUSIC],
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"]
			},

		})
	}
	if (queueLength !== 0 && queueLength <= multiple) {
		return embed.edit({
			content: ` \n__**${bot.translate(settings.Language, 'musicembed:QUEUE_LIST')}:**__\n${queueArray}`,
			embeds: [MUSIC],
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"]
			},
		})
	} else {
		return embed.edit({
			content: `‏‏‎‏‏‎ \n__**${bot.translate(settings.Language, 'musicembed:QUEUE_LIST')}:**__\n${bot.translate(settings.Language, 'musicembed:JOIN_AND_PLAY')}`,
			embeds: [MUSIC],
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"]
			},
		})
	}
};