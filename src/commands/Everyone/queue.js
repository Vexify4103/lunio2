// Dependencies
const Command = require("../../structures/Command.js");
const { paginate } = require("../../utils");
const { EmbedBuilder } = require("discord.js");

module.exports = class Queue extends Command {
	constructor(bot) {
		super(bot, {
			name: "queue",
			helpPerms: "Everyone",
			dirname: __dirname,
			description: "Shows the queue.",
			slash: true,
			usage: "queue",
			music: true,
			reqplayer: false,
			reqvc: false,
			options: [
				{
					name: "page-number",
					description: "Show a specific page of the queue.",
					type: 4,
					required: false,
				},
			],
			methods: [
				{
					name: "<page number>",
					description: "Show a specific page of the queue.",
					perms: "Everyone",
				},
			],
		});
	}

	// Function for message command
	// Function for slash command
	async callback(bot, interaction, guild, args, settings) {
		const player = bot.manager.players.get(guild.id);
		const queue = player.queue;
		let page = interaction.options.getInteger("page-number");
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		let embed;

		if (queue.size == 0) {
			embed = new EmbedBuilder()
				.setColor(bot.config.colorOrange)
				.setDescription(
					bot.translate(
						settings.Language,
						"Everyone/queue:EMBED_NO_SONGINQUEUE"
					)
				);

			return interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		// get total page number
		let pagesNum = Math.ceil(player.queue.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const { title, requester, duration, uri } = player.queue.current;
		const parsedDuration = bot.getduration(duration);
		const parsedQueueDuration = bot.getduration(
			player.queue.reduce((prev, curr) => prev + curr.duration, 0) +
				player.queue.current.duration
		);
		const songStrings = [];
		for (let i = 0; i < player.queue.length; i++) {
			const song = player.queue[i];
			if (settings.Requester) {
				songStrings.push(
					`${i + 1}. ${song.author} - ${
						song.title
					} [${bot.getduration(song.duration)}] ~ <@${
						!song.requester.id ? song.requester : song.requester.id
					}>\n`
				);
			} else {
				songStrings.push(
					`${i + 1}. ${song.author} - ${
						song.title
					} [${bot.getduration(song.duration)}]\n`
				);
			}
		}

		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join("");
			embed = new EmbedBuilder()
				.setColor(await bot.getColor(bot, guild.id))
				.setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
				.setFooter({
					text: bot.translate(
						settings.Language,
						"Everyone/queue:EMBED_SHOW_CURRENT_PAGE",
						{
							CURRENT: i + 1,
							TOTAL: pagesNum,
							SIZE: player.queue.length,
							DURATION: parsedQueueDuration,
						}
					),
				});
			pages.push(embed);
		}
		// If a user specified a page number then show page if not show pagintor.
		if (!page || page == "null") {
			return paginate(bot, interaction, pages, member.id);
		} else {
			if (page > pagesNum) {
				page = pagesNum;
			}
			let pageNum = page == 0 ? 1 : page - 1;
			interaction.reply({
				embeds: [pages[pageNum]],
				ephemeral: true,
			});
		}
	}
};
