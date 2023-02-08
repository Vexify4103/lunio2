const { GuildSchema } = require("../../database/models"),
	Event = require("../../structures/Event");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);
module.exports = class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	// run event
	async run(bot) {
		const clientId = bot.user.id;
		const guildIds = [
			"823543363688464455",
			"866666289178869770",
			"709832515577184287",
		]; // Support Server: 866666289178869770, TEST Server: 823543363688464455, Friends Server: 709832515577184287
		// Load up audio player
		try {
			bot.manager.init(bot.user.id);
		} catch (err) {
			bot.logger.error(
				`Audio manager failed to load due to error: ${err.message}`
			);
		}
		// Updates the bot's status
		bot.user.setStatus("online");

		bot.logger.log(
			"=-=-=-=-=-=-=- Loading Guild Specific Interaction(s) -=-=-=-=-=-=-="
		);

		const rest = new REST({
			version: "10",
		}).setToken(bot.config.token);

		const data = [];
		const prvData = [];

		bot.commands.forEach((command) => {
			try {
				if (command.conf.slash && !command.conf.prv) {
					let item = {
						name: command.help.name,
						description: command.help.description,
						defaultPermission: command.conf.defaultPermission,
					};
					if (command.conf.options[0]) {
						item.options = command.conf.options;
					}
					data.push(item);
				}
				// if (command.conf.slash && command.conf.prv) {
				// 	let item = {
				// 		name: command.help.name,
				// 		description: command.help.description,
				// 		defaultPermission: command.conf.defaultPermission
				// 	}
				// 	prvData.push(item)
				// }
			} catch (error) {
				bot.logger.error(`Error loading /commands ${error}`);
			}
		});

		try {
			bot.logger.log("Started refreshing application (/) commands");

			guildIds.forEach(async (id) => {
				bot.logger.log(
					`Started refreshing application (/) commands in: ${id}`
				);
				await rest.put(Routes.applicationGuildCommands(clientId, id), {
					body: data,
				});
			});

			// bot.logger.log('Reloading private commands')
			// await rest.put(
			// 	Routes.applicationGuildCommand(clientId, '866666289178869770'), {
			// 		body: prvData
			// 	}
			// )

			// for Global commands:
			// await rest.put(
			//      Routes.applicationCommands(clientId), {
			//           body: data
			//      },
			// );

			bot.logger.log("Successfully reloaded application (/) commands");
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

		bot.logger.ready("All guilds have been initialized");

		let supportServer = await bot.guilds.fetch("866666289178869770");
		const Supporter = "951804516490174514";
		const Premium1 = "951807454553976903";
		const Premium3 = "951809000062738462";
		const Premium6 = "951826517535653918";
		const Premium10 = "951826481204580382";
		const Premium15 = "951826570249666560";

		const USERS = await supportServer.members.fetch();

		// console.log(date.$d > new Date())
		const date = dayjs().add(dayjs.duration({ months: 1 }));
		// console.log(date.$d)
		bot.logger.log(`Setting 15min interval for updating user Premium`);
		setInterval(async () => {
			
			bot.logger.log(`Updating user Premium`);
			USERS.map(async (user) => {
				const userSettings = await bot.getUserData(bot, user.user.id);
				if (userSettings.premium) return;
				try {
					if (user._roles.includes(Supporter)) {
						// RUN SUPPORTER
						let settings = {
							premium: true,
							expireDate: date.$d,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
					if (user._roles.includes(Premium1)) {
						// RUN PREMIUM 1
						let settings = {
							premium: true,
							expireDate: date.$d,
							premiumUses: 1,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
					if (user._roles.includes(Premium3)) {
						// RUN PREMIUM 3
						let settings = {
							premium: true,
							expireDate: date.$d,
							premiumUses: 3,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
					if (user._roles.includes(Premium6)) {
						// RUN PREMIUM 6
						let settings = {
							premium: true,
							expireDate: date.$d,
							premiumUses: 6,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
					if (user._roles.includes(Premium10)) {
						// RUN PREMIUM 10
						let settings = {
							premium: true,
							expireDate: date.$d,
							premiumUses: 10,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
					if (user._roles.includes(Premium15)) {
						// RUN PREMIUM 15
						let settings = {
							premium: true,
							expireDate: date.$d,
							premiumUses: 15,
						};
						return await bot.updateUserSettings(
							user.id,
							settings
						);
					}
				} catch (error) {
					bot.logger.error(`Error updating user premium ${error}`);
				}
			});
		}, 1000 * 60 * 15); //1000 * 60 * 15 //15min

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
	}
};
