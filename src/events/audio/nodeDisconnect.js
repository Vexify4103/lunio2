const { EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");

class NodeDisconnect extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, node, reason) {
		let embed;
		try {
			bot.guilds.cache.forEach(async (guild) => {
				const player = bot?.manager?.players?.get(guild.id);
				if (!player) return;
				if (player.node.options.identifier !== node.options.identifier)
					return;
				bot.logger.lavalinkError(
					`node: ${
						node.options.identifier
					} has disconnect, reason: ${
						reason.reason ? reason.reason : "unspecified"
					}`
				);
				const settings = await bot.getGuildData(bot, guild.id);
				if (settings.CustomChannel) {
					try {
						let customch = await bot.channels.fetch(
							settings.mChannelID
						);

						embed = new EmbedBuilder()
							.setColor(bot.config.colorWrong)
							.setDescription(
								bot.translate(
									settings.Language,
									"misc:PLAYER_ERROR"
								)
							);

						customch.send({
							embeds: [embed],
						});
						// await bot.musicoff(bot, settings);
						return player.destroy();
					} catch (error) {
						bot.logger.lavalinkError(
							`error on nodeDisconnect ${error}`
						);
					}
				} else {
					let channel = await bot.channels.fetch(player.textChannel);

					embed = new EmbedBuilder()
						.setColor(bot.config.colorWrong)
						.setDescription(
							bot.translate(
								settings.Language,
								"misc:PLAYER_ERROR"
							)
						);

					channel.send({
						embeds: [embed],
					});
					return player.destroy();
				}
			});
		} catch (error) {
			bot.logger.lavalinkError(`error on nodeDisconnect: ${error}`);
		}
	}
}

module.exports = NodeDisconnect;
