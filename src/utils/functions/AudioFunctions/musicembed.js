const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionsBitField,
} = require("discord.js");
const getduration = require("./getduration");

module.exports = async (bot, player, settings) => {
	let channelid = settings.mChannelID;
	let embedid = settings.mChannelEmbedID;
	let requester = settings.Requester;
	let channel = await bot.channels.fetch(channelid);
	let guild = await bot.guilds.fetch(player.guild);
	let embed = await channel.messages.fetch(embedid);

	const oldTime = embed.createdTimestamp;
	const newTime = oldTime + bot.config.changeableSettings.refreshEmbedTime;

	// IF DATE NOW IS OLDER THAN OLD TIME + 3 HOURS
	if (newTime < Date.now()) {
		await bot.refreshEmbed(bot, settings);
		settings = await bot.getGuildData(bot, player.guild);
		channelid = settings.mChannelID;
		embedid = settings.mChannelEmbedID;
		requester = settings.Requester;
		channel = await bot.channels.fetch(channelid);
		guild = await bot.guilds.fetch(player.guild);
		embed = await channel.messages.fetch(embedid);
	}

	if (!player) return await bot.musicoff(bot, settings);

	//console.log(player.queue)
	//player.queue = await bot.replaceTitle(bot, player.queue);
	const queue = player.queue;
	const track = player.queue.current;
	let modifiedTitle = await bot.replaceTitle(bot, player.queue.current);
	//console.log(test)
	const multiple = 15;
	const page = 1;
	const end = page * multiple;
	const start = end - multiple;
	const tracksnormal = queue.slice(start, end);
	const tracks = tracksnormal.reverse();
	const queueLength = queue.length;
	let queueArray;

	let thumbnail = bot.config.music_playing_banner;

	let footer = {
		text: bot.translate(settings.Language, "musicembed:FOOTER", {
			QUEUEAMOUNT: `${queue.length || 0}`,
			PLAYERVOLUME: player.volume,
			PLAYERREPEAT: `${
				player.queueRepeat
					? `| ${bot.translate(
							settings.Language,
							"musicembed:LOOP_QUEUE"
					  )}`
					: player.trackRepeat
					? `| ${bot.translate(
							settings.Language,
							"musicembed:LOOP_SONG"
					  )}`
					: ""
			}`,
			PAUSED: `${
				player.paused
					? `| ${bot.translate(
							settings.Language,
							"musicembed:SONG_PAUSED"
					  )}`
					: ""
			}`,
		}),
	};

	if (
		!channel
			.permissionsFor(guild.members.me)
			.has(PermissionsBitField.Flags.ReadMessageHistory)
	) {
		const ERROR = new EmbedBuilder()
			.setDescription(
				`I need the permission: ${bot.codeBlock(
					"Read History"
				)} in here which is required.`
			)
			.setColor(bot.config.colorWrong);

		return channel.send({
			embeds: [ERROR],
		});
	}

	let color = guild.members.me.displayHexColor;

	if (color === "#000000") {
		color = bot.config.color;
	}

	let Author = {
		name: `[${getduration(track.duration)}] - ${track.author} - ${
			modifiedTitle
		}`,
		iconURL: bot.user.displayAvatarURL({
			format: "png",
		}),
	};
	const MUSIC = new EmbedBuilder()
		.setAuthor(Author)
		.setImage(thumbnail)
		.setColor(color)
		.setFooter(footer);

	if (requester) {
		MUSIC.setDescription(
			bot.translate(settings.Language, "musicembed:REQUESTED_BY", {
				REQUESTER: track.requester,
			})
		);
		queueArray = tracks
			.map(
				(_, i, trackM) =>
					`${trackM.length - i}. ${trackM[i].author} - ${
						trackM[i].title
					} [${getduration(trackM[i].duration)}] ~ <@${
						trackM[i].requester.id
					}>`
			)
			.join("\n");
	} else {
		queueArray = tracks
			.map(
				(_, i, trackM) =>
					`${trackM.length - i}. ${trackM[i].author} - ${
						trackM[i].title
					} [${getduration(trackM[i].duration)}]`
			)
			.join("\n");
	}

	// if (requester) {
	// 	MUSIC.setDescription(bot.translate(settings.Language, 'musicembed:REQUESTED_BY', {
	// 		REQUESTER: track.requester
	// 	}))
	// 	queueArray = tracks.map((_, i, trackM) => `${trackM.length - i}. ${trackM[i].author} - ${trackM[i].title} [${getduration(trackM[i].duration)}] ~ <@${trackM[i].requester.id}>`).join("\n")
	// } else {
	// 	queueArray = tracks.map((_, i, trackM) => `${trackM.length - i}. ${trackM[i].author} - ${trackM[i].title} [${getduration(trackM[i].duration)}]`).join("\n")
	// }

	let pausemode;
	let pausemodeemoji;
	let loopmode;
	let loopemoji;
	let components;

	if (!player.trackRepeat && !player.queueRepeat) {
		loopmode = "loop";
		loopemoji = "999694398579277886";
	}
	if (player.queueRepeat && !player.trackRepeat) {
		loopmode = "loopqueue";
		loopemoji = "999694399661420554";
	}
	if (player.trackRepeat && !player.queueRepeat) {
		loopmode = "loopsong";
		loopemoji = "999694400772915320";
	}
	//

	if (player.paused) {
		pausemode = "play";
		pausemodeemoji = "999694402966519878";
	} else {
		pausemode = "pause";
		pausemodeemoji = "999694401494331454";
	}

	components = [
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(`${pausemodeemoji}`)
				.setCustomId(`${pausemode}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694406321963068")
				.setCustomId("skip"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694397337776171")
				.setCustomId("clear"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(`${loopemoji}`)
				.setCustomId(`${loopmode}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("999694405218865172")
				.setCustomId("shuffle"),
		]),
		new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel("Add to Playlist")
				.setCustomId("atp"),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Remove from Playlist")
				.setCustomId("rfp"),
		]),
	];

	if (queueLength > multiple) {
		return embed.edit({
			content: `‏‏‎‏‏‎ \n__**${bot.translate(
				settings.Language,
				"musicembed:QUEUE_LIST"
			)}:**__\n\n${bot.translate(
				settings.Language,
				"musicembed:AND_MORE",
				{
					AMOUNT: queueLength - multiple,
				}
			)}\n${queueArray}`,
			embeds: [MUSIC],
			components: components,
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"],
			},
		});
	}
	if (queueLength !== 0 && queueLength <= multiple) {
		return embed.edit({
			content: ` \n__**${bot.translate(
				settings.Language,
				"musicembed:QUEUE_LIST"
			)}:**__\n${queueArray}`,
			embeds: [MUSIC],
			components: components,
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"],
			},
		});
	} else {
		return embed.edit({
			content: `‏‏‎‏‏‎ \n__**${bot.translate(
				settings.Language,
				"musicembed:QUEUE_LIST"
			)}:**__\n${bot.translate(
				settings.Language,
				"musicembed:JOIN_AND_PLAY"
			)}`,
			embeds: [MUSIC],
			components: components,
			allowedMentions: {
				repliedUser: false,
				parse: ["everyone"],
			},
		});
	}
};
