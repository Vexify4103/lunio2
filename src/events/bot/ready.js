const { GuildSchema } = require("../../database/models"),
	Event = require("../../structures/Event");

require("dotenv").config();
const { ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

module.exports = class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	// run event
	async run(bot) {
		bot.user.setStatus("idle");
		bot.user.setActivity({
			name: "starting...",
			type: ActivityType.Playing,
		});

		const clientId = bot.user.id;
		const guildIds = [
			"823543363688464455",
			"866666289178869770",
		]; // Support Server: 866666289178869770, TEST Server: 823543363688464455, Friends Server: 709832515577184287
		// Load up audio player
		try {
			bot.manager.init(bot.user.id);
		} catch (err) {
			bot.logger.error(
				`Audio manager failed to load due to error: ${err.message}`
			);
		}

		bot.logger.log(
			"=-=-=-=-=-=-=- Loading Guild Specific Interaction(s) -=-=-=-=-=-=-="
		);

		const rest = new REST({
			version: "10",
		}).setToken(process.env.TOKEN);

		const data = [];
		const prvData = [];

		bot.commands.forEach((command) => {
			try {
				if (command.conf.slash && !command.conf.prv) {
					let item = {
						name: command.help.name,
						description: command.help.description,
						default_member_permissions:
							command.conf.default_member_permissions != null
								? command.conf.default_member_permissions.toString()
								: undefined,
					};
					if (command.conf.options[0]) {
						item.options = command.conf.options;
					}
					data.push(item);
				}
				if (command.conf.slash && command.conf.prv) {
					let item = {
						name: command.help.name,
						description: command.help.description,
						default_member_permissions:
							command.conf.default_member_permissions != null
								? command.conf.default_member_permissions.toString()
								: undefined,
					};
					if (command.conf.options[0]) {
						item.options = command.conf.options
					}
					prvData.push(item)
				}
			} catch (error) {
				bot.logger.error(`Error loading /commands ${error}`);
			}
		});

		//console.log(data);
		try {
			guildIds.forEach(async (id) => {
				bot.logger.log(
					`Started refreshing application (/) commands in: ${id}`
				);
				if (id === bot.config.SupportServer.GuildID) {
					bot.logger.log('Reloading private commands')
					const combinedData = prvData.concat(data)
					await rest.put(
						Routes.applicationGuildCommands(clientId, bot.config.SupportServer.GuildID), {
							// body: [],
							body: combinedData,
						}
					)
				} else {
					await rest.put(Routes.applicationGuildCommands(clientId, id), {
						// body: [],
						body: data,
					});
				}
			});


			// for Global commands:
			// await rest.put(
			//      Routes.applicationCommands(clientId), {
			//           body: data
			//      },
			// );
			bot.logger.log(
				"=-=-=-=-=-=-=- Loading Guild Specific Interaction(s) -=-=-=-=-=-=-="
			);
		} catch (error) {
			console.error(error);
		}

		const data2 = await GuildSchema.find({});
		if (data2.length > bot.guilds.cache.size) {
			// A server kicked the bot when it was offline
			const guildCount = [];
			// Get bot guild ID's
			for (let i = 0; i < bot.guilds.cache.size; i++) {
				guildCount.push([...bot.guilds.cache.values()][i].id);
			}
			// Now check database for bot guild ID's
			for (const guild of data2) {
				if (!guildCount.includes(guild.guildID)) {
					bot.emit("guildDelete", {
						id: guild.guildID,
						name: guild.guildName,
					});
				}
			}
		}

		const supportServer = await bot.guilds.fetch(
			bot.config.SupportServer.GuildID
		);
		const roleMappings = {
			"951804516490174514": { premiumUses: null }, // SUPPORTER
			"951807454553976903": { premiumUses: 1 }, // PREMIUM 1
			"951809000062738462": { premiumUses: 3 }, // PREMIUM 3
			"951826517535653918": { premiumUses: 6 }, // PREMIUM 6
			"951826481204580382": { premiumUses: 10 }, // PREMIUM 10
			"951826570249666560": { premiumUses: 15 }, // PREMIUM 15
		};

		const USERS = await supportServer.members.fetch();
		const currentDate = new Date();
		const nextMonthDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			currentDate.getDate()
		);
		const expireDate = nextMonthDate.getTime();

		bot.logger.log(`Updating user Premium`);

		for (const [, user] of USERS) {
			const userSettings = await bot.getUserData(bot, user.user.id);
			if (userSettings.premium) continue;
			try {
				for (const roleID in roleMappings) {
					if (user._roles.includes(roleID)) {
						const { premiumUses } = roleMappings[roleID];
						const settings = {
							premium: true,
							premiumExpireDate: expireDate,
							premiumUses,
						};
						await bot.updateUserSettings(user.id, settings);
						break;
					}
				}
			} catch (error) {
				bot.logger.error(`Error updating user premium ${error}`);
			}
		}

		// LOG ready event
		bot.logger.log(
			"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=",
			"ready"
		);
		bot.logger.log(
			`${bot.user.tag}, ready to serve [${bot.users.cache.size}] users in [${bot.guilds.cache.size}] servers`,
			"ready"
		);
		bot.logger.log(
			"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=",
			"ready"
		);
		setTimeout(() => {
			bot.user.setStatus("online");
			bot.user.setActivity({
				name: "/help",
				type: ActivityType.Listening,
			});
		}, 1000 * 60 * 5);
	}
};
