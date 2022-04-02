const Event = require('../../structures/Event');
const {
	MessageEmbed
} = require('discord.js');

class TrackError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track, payload) {
		const settings = await bot.getGuildData(bot, player.gild)
		//console.log(track)
		bot.logger.log(`Track error: ${payload.error} in guild: ${player.guild} for this song: ${track.title}.`);

		let title = bot.translate(settings.Language, 'misc:ERROR_TITLE')
		let embed = new MessageEmbed()
			.setColor(bot.config.colorWrong)
			.setTitle(title)
			.setDescription(`[${track.title}](${track.uri})`)

		let channel = await bot.channels.fetch(player.textChannel)
		if (settings.CustomChannel) {
			const ch = await bot.channels.fetch(settings.mChannelID);
			
			await bot.musicoff(bot, settings);

			ch.send({
				embeds: [embed]
			})
		} else {
			return channel.send({
				embeds: [embed]
			})
		}
		// reset player filter (might be the cause)
		player.resetFilter();
		if (!player.queue && !player.queue.current) return player.destroy()
	}
}

module.exports = TrackError;