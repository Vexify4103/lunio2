module.exports = async (bot, guildId) => {
	let color;
	await bot.guilds.fetch(guildId).then((m) => {
		color = m.members.cache.get(bot.user.id).displayHexColor
	})

	if (color === "#000000") {
		color = bot.config.color;
	}
	return color;
};