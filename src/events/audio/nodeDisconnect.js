const { EmbedBuilder } = require('discord.js');
const Event = require('../../structures/Event');

class NodeDisconnect extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, node, reason) {
		bot.logger.error(`Lavalink node: ${node.options.identifier} has disconnect, reason: ${(reason.reason) ? reason.reason : 'unspecified'}.`);
		let embed;
		try {
			bot.guilds.cache.forEach(async guild => {
				const player = bot?.manager?.players?.get(guild.id);
				const settings = await bot.getGuildData(bot, guild.id);
				if (player) {
					if (settings.CustomChannel) {
						try {
							let customch = await bot.channels.fetch(settings.mChannelID);

							embed = new EmbedBuilder()
								.setColor(bot.config.colorWrong)
								.setDescription(bot.translate(settings.Language, 'misc:PLAYER_ERROR'))

							customch.send({
								embeds: [embed]
							})
							await bot.musicoff(bot, settings);
							return player.destroy();
						} catch (error) {
							bot.logger.error(`Error on nodeDisconnect ${error}`)
						}
					} else {
						let channel = await bot.channels.fetch(player.textChannel);

						embed = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(bot.translate(settings.Language, 'misc:PLAYER_ERROR'))


						channel.send({
							embeds: [embed]
						})
						return player.destroy();
					}
				}
			});
		} catch (error) {
			bot.logger.error(`Error on nodeDisconnect: ${error}`)
		}
	}
}

module.exports = NodeDisconnect;