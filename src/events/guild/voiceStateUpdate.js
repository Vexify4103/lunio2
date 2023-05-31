const { ChannelType } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class voiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, oldState, newState) {
		// get guild and player
		const guildId = newState.guild.id || oldState?.guild.id;
		const player = bot.manager.players.get(guildId);
		const settings = await bot.getGuildData(bot, guildId);

		if (oldState.channelId && !newState.channelId) {
			try {
				if (oldState.member.user.id === bot.user.id) {
					// IF bot left vc, destroy player
					if (!player) return;
					player.destroy();
				}
			} catch (error) {
				bot.logger.lavalinkError(`${guildId} error destroying player`)
			}
		}
		// check if the bot is active (playing, paused or empty does not matter (return otherwise)
		if (!player || player.state !== "CONNECTED") {
			if (player) {
				player.destroy();
			}
			return;
		}

		// prepreoces the data
		const stateChange = {};

		// get the state change
		if (oldState.channel === null && newState.channel !== null)
			stateChange.type = "JOIN";
		if (oldState.channel !== null && newState.channel === null)
			stateChange.type = "LEAVE";
		if (oldState.channel !== null && newState.channel !== null)
			stateChange.type = "MOVE";
		if (oldState.channel === null && newState.channel === null) return;

		if (
			newState.id === bot.user.id &&
			newState.serverMute == true &&
			oldState.serverMute == false
		) {
			player.pause(true);
			if (settings.CustomChannel)
				await bot.musicembed(bot, player, settings);
			return;
		}
		if (
			newState.id === bot.user.id &&
			newState.serverMute == false &&
			oldState.serverMute == true
		) {
			player.pause(false);
			if (settings.CustomChannel)
				await bot.musicembed(bot, player, settings);
			return;
		}

		// move check first as it changes type
		if (stateChange.type === "MOVE") {
			if (oldState.channel.id === player.voiceChannel)
				stateChange.type = "LEAVE";
			if (newState.channel.id === player.voiceChannel)
				stateChange.type = "JOIN";
		}
		// double triggered on purpose for MOVE events
		if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
		if (stateChange.type === "LEAVE")
			stateChange.channel = oldState.channel;

		// check if the bot's voice channel is involved (return otherwise)
		if (
			!stateChange.channel ||
			stateChange.channel.id !== player.voiceChannel
		)
			return;

		if (
			newState.id === bot.user.id &&
			oldState.serverDeaf === true &&
			newState.serverDeaf === false
		) {
			try {
				newState.setDeaf(true);
			} catch (error) {
				console.error(error);
			}
		}

		if (
			newState.id == bot.user.id &&
			newState.type == ChannelType.GuildStageVoice
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
					player.pause(true);
					if (settings.CustomChannel) {
						if (player.queue.current)
							await bot.musicembed(bot, player, settings);
					}
				}
			} else if (oldState.suppress !== newState.suppress) {
				player.pause(newState.suppress);
				if (settings.CustomChannel) {
					if (player.queue.current)
						await bot.musicembed(bot, player, settings);
				}
			}
		}

		stateChange.members = stateChange.channel.members.filter(
			(member) => !member.user.bot
		);

		switch (stateChange.type) {
			case "JOIN":
				if (stateChange.members.size === 1 && player.paused) {
					player.pause(false);
					if (settings.CustomChannel)
						await bot.musicembed(bot, player, settings);

					if (player.timeout) clearTimeout(player.timeout);
					if (player.timeout2) clearTimeout(player.timeout2);
					if (player.timeout3) clearTimeout(player.timeout3);
				}
				break;
			case "LEAVE":
				if (stateChange.members.size === 0 && !player.paused) {
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
