const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionsBitField,
} = require("discord.js");
const getduration = require("./getduration");

module.exports = async (
	bot,
	player,
	{ mChannelID, mChannelEmbedID, Requester, Language }
) => {
	const [guild, channel, embed] = await Promise.all([
		bot.guilds.fetch(player.guild),
		bot.channels.fetch(mChannelID),
		(await bot.channels.fetch(mChannelID)).messages.fetch(mChannelEmbedID),
	]);

	if (!player)
		return await bot.musicoff(bot, {
			mChannelID,
			mChannelEmbedID,
			Language,
		});

	const queue = player.queue;
	const track = player.queue.current;
	const modifiedTitle = await bot.replaceTitle(bot, player.queue.current);
	const multiple = 15;
	const page = 1;
	const end = page * multiple;
	const start = end - multiple;
	const tracksnormal = queue.slice(start, end);
	const tracks = tracksnormal.reverse();
	const queueArray = tracks
		.map(
			(track, i) =>
				`**${tracks.length - i}.** ${track.author} - ${
					track.title
				} [${getduration(track.duration)}]` +
				`${Requester ? ` ~ <@${track.requester.id}>` : ""}`
		)
		.join("\n");

	let thumbnail = bot.config.music_playing_banner;
	let color = guild.members.me.displayHexColor;
	if (color === "#000000") {
		color = bot.config.color;
	}

	let Author = {
		name: `[${getduration(track.duration)}] - ${
			track.author
		} - ${modifiedTitle}`,
		iconURL: bot.user.displayAvatarURL({ format: "png" }),
	};

	const description = bot.translate(Language, "musicembed:REQUESTED_BY", {
		REQUESTER: track.requester,
	});

	const footerText = bot.translate(Language, "musicembed:FOOTER", {
		QUEUEAMOUNT: `${queue.length || 0}`,
		PLAYERVOLUME: player.volume,
		PLAYERREPEAT: `${
			player.queueRepeat
				? `| ${bot.translate(Language, "musicembed:LOOP_QUEUE")}`
				: player.trackRepeat
				? `| ${bot.translate(Language, "musicembed:LOOP_SONG")}`
				: ""
		}`,
		PAUSED: `${
			player.paused
				? `| ${bot.translate(Language, "musicembed:SONG_PAUSED")}`
				: ""
		}`,
	});

	let loopemoji;
	let loopmode;
	//console.log(player.queueRepeat);
	//console.log(player.trackRepeat);
	switch (true) {
		//loopqueue: true and false
		case player.queueRepeat && !player.trackRepeat:
			loopmode = "loopqueue";
			loopemoji = "999694399661420554";
			break;
		// loopsong: false and true
		case player.trackRepeat && !player.queueRepeat:
			loopmode = "loopsong";
			loopemoji = "999694400772915320";
			break;
		default:
			// DEFAULT EMOJI
			loopmode = "loop";
			loopemoji = "999694398579277886";
	}

	let pausemode;
	let pausemodeemoji;

	pausemode = player.paused ? "play" : "pause";
	pausemodeemoji = player.paused
		? "999694402966519878"
		: "999694401494331454";

	const buttons = {
		pause: {
			style: ButtonStyle.Secondary,
			emoji: pausemodeemoji,
			customId: pausemode,
		},
		skip: {
			style: ButtonStyle.Secondary,
			emoji: "999694406321963068",
			customId: "skip",
		},
		clear: {
			style: ButtonStyle.Secondary,
			emoji: "999694397337776171",
			customId: "clear",
		},
		loop: {
			style: ButtonStyle.Secondary,
			emoji: loopemoji,
			customId: loopmode,
		},
		shuffle: {
			style: ButtonStyle.Secondary,
			emoji: "999694405218865172",
			customId: "shuffle",
		},
	};

	const components = [
		new ActionRowBuilder().addComponents(
			Object.entries(buttons).map(([, { style, emoji, customId }]) =>
				new ButtonBuilder()
					.setStyle(style)
					.setEmoji(emoji)
					.setCustomId(customId)
			)
		),
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

	const ERROR = new EmbedBuilder()
		.setDescription(
			`I need the permission: ${bot.codeBlock(
				"Read History"
			)} in here which is required.`
		)
		.setColor(bot.config.colorWrong);

	if (
		!channel
			.permissionsFor(guild.members.me)
			.has(PermissionsBitField.Flags.ReadMessageHistory)
	) {
		return channel.send({
			embeds: [ERROR],
		});
	}

	const MUSIC = new EmbedBuilder()
		.setAuthor(Author)
		.setImage(thumbnail)
		.setColor(color)
		.setFooter({ text: footerText });

	if (Requester) {
		MUSIC.setDescription(description);
	}

	let content;
	if (queue.length > multiple) {
		content = `\n__**${bot.translate(
			Language,
			"musicembed:QUEUE_LIST"
		)}:**__\n\n${bot.translate(Language, "musicembed:AND_MORE", {
			AMOUNT: queue.length - multiple,
		})}\n${queueArray}`;
	} else if (queue.length !== 0 && queue.length <= multiple) {
		content = ` \n__**${bot.translate(
			Language,
			"musicembed:QUEUE_LIST"
		)}:**__\n${queueArray}`;
	} else {
		content = `‏‏‎‏‏‎ \n__**${bot.translate(
			Language,
			"musicembed:QUEUE_LIST"
		)}:**__\n${bot.translate(Language, "musicembed:JOIN_AND_PLAY")}`;
	}

	await embed.edit({
		content: content,
		embeds: [MUSIC],
		components: components,
		allowedMentions: {
			repliedUser: false,
			parse: ["everyone"],
		},
	});
};
