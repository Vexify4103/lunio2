const { EmbedBuilder } = require("discord.js");

module.exports = class LunioEmbed extends EmbedBuilder {
	constructor(bot, guild, data = {}) {
		super(data);
		this.bot = bot;
		this.guild = guild;
		this.setColor(bot.config.embedColor).setTimestamp();
	}

	// Language translator for title
	setTitle(key, args) {
		const language =
			this.guild?.settings.Language ??
			this.bot.config.defaultSettings.Language;
		this.title = this.bot.translate(language, key, args)
			? this.bot.translate(language, key, args)
			: key;
		return this;
	}

	// Language translator for footer
	setFooter(key, args, icon) {
		if (typeof args === "object") {
			const language =
				this.guild?.settings.Language ??
				this.bot.config.defaultSettings.Language;
			this.footer = {
				text: this.bot.translate(language, key, args),
				iconURL: icon,
			};
		} else {
			this.footer = {
				text: key,
				iconURL: args,
			};
		}
		return this;
	}
};
