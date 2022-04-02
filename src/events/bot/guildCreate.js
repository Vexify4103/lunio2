// Dependencies
const {
	MessageEmbed,
} = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class GuildCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guild) {
		// // Apply server settings

		// // try {
		// // 	const newGuild = {
		// // 		guildID: guild.id
		// // 	};

		// // 	// Create guild settings and fetch cache.
		// // 	await bot.CreateGuild(newGuild);
		// // 	await guild.fetchSettings();
		// // } catch (err) {
		// // 	bot.logger.error(`Event: '${this.config.name}' has error: ${err.message}.`);
		// // }
		// let settings = await bot.getGuildData(bot, guild.id)
		// // get slash commands for category
		// const enabledPlugins = settings.plugins;
		// const data = [];
		// for (let i = 0; i < enabledPlugins.length; i++) {
		// 	const g = await bot.loadInteractionGroup(enabledPlugins[i], guild);
		// 	if (Array.isArray(g)) data.push(...g);
		// }
		// // upload slash commands to guild
		// try {
		// 	await await bot.guilds.fetch(guild.id)?.commands.set(data)
		// 	bot.logger.log('Loaded Interactions for guild: ' + guild.name)
		// } catch (err) {
		// 	bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		// }

		// const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel).catch(() => bot.logger.error(`Error fetching logs channel`));

		// const embed = new MessageEmbed()
		// 	.setColor(bot.config.colorTrue)
		// 	.setTitle(`${check} Joined Guild`)
		// 	.addField(`GuildID`, `${guild.id ?? 'undefined'}`)
		// 	.addField(`Owner`, `**ID**: ${guild.ownerId}`)
		// 	.addField(`MemberCount`, `${guild?.memberCount ?? 'undefined'}`)
		// 	.setTimestamp()

		// try {
		// 	modChannel.send({
		// 		embeds: [embed]
		// 	})
		// } catch (error) {
		// 	bot.logger.error(message)
		// }
	}
};