const { ChannelType, PermissionsBitField } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class ChannelDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, channel) {
		let settings = await bot.getGuildData(bot, channel.guild.id);
		let irc = await bot.isrequestchannel(channel.id, settings);

		try {
			if (channel.type === ChannelType.GuildVoice) {
				if (channel.members.has(bot.user.id)) {
					var player = bot.music.players.get(channel.guild.id);
					if (!player) return;
					if (channel.id === player.voiceChannel) {
						player.destroy();
					}
				}
			} else if (irc) {
				var player = bot.manager.players.get(channel.guild.id);

				let settingsREMOVE = {
					CustomChannel: false,
					mChannelID: "",
					mChannelEmbedID: "",
					mChannelBannerID: "",
				};
				await bot.updateGuildSettings(channel.guild.id, settingsREMOVE);

				if (!player) return; // If no player exists, return

				let channelToSend = null;
				const guild = channel.guild;

				guild.channels.cache.forEach((channel1) => {
					if (
						channel1.type === ChannelType.GuildText &&
						channel1
							.permissionsFor(guild.members.me)
							.has(PermissionsBitField.Flags.SendMessages) &&
						channel1.name.toLowerCase().includes("bot")
					) {
						channelToSend = channel1.id; // Assign the channel ID instead of the channel object
					}
				});

				if (!channelToSend) {
					guild.channels.cache.forEach((channel1) => {
						if (
							channel1.type === ChannelType.GuildText &&
							channel1
								.permissionsFor(guild.members.me)
								.has(PermissionsBitField.Flags.SendMessages)
						) {
							channelToSend = channel1.id; // Assign the channel ID instead of the channel object
						}
					});
				}

				if (!channelToSend) return;

				player.setTextChannel(channelToSend);
			}
		} catch (err) {
			console.error(err);
		}
	}
};
