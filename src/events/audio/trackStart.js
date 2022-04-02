const {
	MessageEmbed
} = require('discord.js');
const Event = require('../../structures/Event');

class TrackStart extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, player, track) {
		let settings = await bot.getGuildData(bot, player.guild);
		var title = track.title;
		var url = track.uri;
		bot.logger.log(`${player.guild} started track: ${track.author} - ${track.title}`)
		if (player.timeout != null) return clearTimeout(player.timeout);
		if (settings.CustomChannel) {
			return await bot.musicembed(bot, player, settings);
		}
		if (settings.Announce) {
			let description
			if (settings.Requester) {
				description = `[${title}](${url}) ~ <@${track.requester.id}>`
			} else {
				description = `[${title}](${url})`
			}
			let title2 = bot.translate(settings.Language, 'misc:NOW_PLAYING')
			let embed = new MessageEmbed()
				.setColor(await bot.getColor(bot, player.guild))
				.setTitle(title2)
				.setDescription(description)

			let channel = await bot.channels.fetch(player.textChannel)

			if (settings.DelAnnounce) {
				if (channel) channel.send({
					embeds: [embed]
				}).then(m => {
					setTimeout(() => m.delete(), (track.duration < 6.048e+8) ? track.duration : 60000)
				}).catch((err) => {
					console.error(err)
				})
			} else {
				if (channel) channel.send({
					embeds: [embed]
				})
			}
		}

		return;
	}
}

module.exports = TrackStart;