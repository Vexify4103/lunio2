const { ChannelType } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class voiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, oldState, newState) {
		const stateChange = {};
		let timeout247;

		if (oldState.channel === null && newState.channel !== null)
			stateChange.type = "JOIN";
		if (oldState.channel !== null && newState.channel === null)
			stateChange.type = "LEAVE";
		if (oldState.channel !== null && newState.channel !== null)
			stateChange.type = "MOVE";
		if (oldState.channel === null && newState.channel === null) return;

		const channel = newState.guild.channels.cache.get(
			newState.channel?.id ?? newState.channelId
		);
		let settings = await bot.getGuildData(
			bot,
			oldState.guild.id || newState.guild.id
		);
		const player = bot.manager.players.get(
			oldState.guild.id || newState.guild.id
		);

		if (
			newState.id === bot.user.id &&
			oldState.serverDeaf === true &&
			newState.serverDeaf === false
		) {
			try {
				newState.setDeaf(true);
				if (player?.paused) return;
				if (player?.playing) {
					setTimeout(() => {
						player.pause(true);
						setTimeout(() => {
							player.pause(false);
						}, bot.ws.ping * 2);
					}, bot.ws.ping * 2);
				}
			} catch (error) {
				console.error(error);
			}
		}

		if (oldState.channelId && !newState.channelId) {
			try {
				if (oldState.member.user.id === bot.user.id && player) {
					player.destroy();
				}
			} catch (err) {
				console.error(err);
			}
		}

		if (
			player &&
			!newState.guild.members.cache.get(bot.user.id).voice.channelId
		)
			player.destroy();

		if (
			newState.id == bot.user.id &&
			channel?.type == ChannelType.GuildStageVoice
		) {
			if (!oldState.channelId) {
				try {
					await newState.guild.members.me.voice
						.setSuppressed(false)
						.then(() =>
							bot.logger.log(
								`${settings.guildID} joined stage channel`
							)
						);
				} catch (err) {
					player?.pause(true);
				}
			} else if (oldState.suppress !== newState.suppress) {
				player?.pause(newState.suppress);
			}
		}

		if (oldState.id === bot.user.id) return;
		if (!oldState.guild.members.cache.get(bot.user.id).voice.channelId)
			return;

		let stateChangeMembers = {};
		let channelCheck =
			newState.guild.channels.cache.get(
				newState.channel?.id ?? newState.channelId
			) ||
			oldState.guild.channels.cache.get(
				oldState.channel?.id ?? oldState.channelId
			);
		stateChangeMembers = channelCheck.members.filter(
			(member) => !member.user.bot
		);

		if (!player) return;
		switch (stateChange.type) {
			case "JOIN":
				bot.logger.debug("JOIN");
				if (
					stateChangeMembers.size >= 1 &&
					player.paused &&
					channel.id === player.voiceChannel
				) {
					player.pause(false);
					if (
						player.playing &&
						player.queue.current &&
						player.queue.size
					) {
						if (settings.CustomChannel)
							await bot.musicembed(bot, player, settings);
					}
					if (player.timeout) clearTimeout(player.timeout);
					if (player.timeout2) clearTimeout(player.timeout2);
					if (player.timeout3) clearTimeout(player.timeout3);
				}
				break;
			case "LEAVE":
				bot.logger.debug("LEAVE");
				if (stateChangeMembers.size === 0) {
					if (player.playing) player.pause(true);
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);
					bot.manager.emit(
						"queueEnd",
						player,
						player.queue.current,
						bot
					);
				}
				break;
		}
	}
};
