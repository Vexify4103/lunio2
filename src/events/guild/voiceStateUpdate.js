const { ChannelType } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class voiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldState, newState) {
		const stateChange = {};
		let timeout247;
		// get the state change
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

		// check if bot got server un-defeaned or not
		if (
			newState.id === bot.user.id &&
			oldState.serverDeaf === true &&
			newState.serverDeaf === false
		) {
			try {
				newState.setDeaf(true);
				if (player.paused === true) return;
				if (player.playing === true) {
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
				if (oldState.member.user.id === bot.user.id) {
					// IF bot left vc, destroy player
					if (!player) return;
					player.destroy();
				}
			} catch (err) {
				console.error(err);
			}
		}

		if (!player) return;
		if (!newState.guild.members.cache.get(bot.user.id).voice.channelId)
			player.destroy();

		if (
			newState.id == bot.user.id &&
			channel?.type == ChannelType.GuildStageVoice
		) {
			if (!oldState.channelId) {
				try {
					await newState.guild.members.me.voice
						.setSuppressed(false)
						.then(() => bot.logger.log("Joined stage channel"));
				} catch (err) {
					player.pause(true);
				}
			} else if (oldState.suppress !== newState.suppress) {
				player.pause(newState.suppress);
			}
		}

		if (oldState.id === bot.user.id) return;
		if (!oldState.guild.members.cache.get(bot.user.id).voice.channelId)
			return;

		let stateChangeMembers = {};
		let channelcheck =
			newState.guild.channels.cache.get(
				newState.channel?.id ?? newState.channelId
			) ||
			oldState.guild.channels.cache.get(
				oldState.channel?.id ?? oldState.channelId
			);
		stateChangeMembers = channelcheck.members.filter(
			(member) => !member.user.bot
		);
		switch (stateChange.type) {
			case "JOIN":
				if (!player) return;
				if (stateChangeMembers.size >= 1 && player.paused) {
					//resume track
					player.pause(false);
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);
					if (player.timeout) clearTimeout(player.timeout);
					if (timeout247) clearTimeout(timeout247);
					return;
				}
				break;
			case "LEAVE":
				if (!player) return;
				if (stateChangeMembers.size === 0 && player.playing) {
					//pause track
					player.pause(true);
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);

					if (!settings.twentyFourSeven) {
						//player.pause(true);
						bot.manager.emit(
							"queueEnd",
							player,
							player.queue.current,
							bot
						);
					} else {
						timeout247 = setTimeout(async () => {
							if (settings.CustomChannel) {
								player.queue.clear();
								player.stop();
								await bot.musicoff(bot, settings);
							}
						}, bot.config.LeaveTimeout);
					}
					return;
				}
				break;
		}
	}
};
