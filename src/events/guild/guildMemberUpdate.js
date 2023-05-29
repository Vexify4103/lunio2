const Event = require("../../structures/Event");

class GuildMemberUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, oldMember, newMember) {
		if (
			newMember.guild.id !== bot.config.SupportServer.GuildID ||
			oldMember.user.id === bot.user.id ||
			oldMember.partial
		)
			return;

		const roleMappings = {
			"951804516490174514": { premiumUses: null }, // SUPPORTER
			"951807454553976903": { premiumUses: 1 }, // PREMIUM 1
			"951809000062738462": { premiumUses: 3 }, // PREMIUM 3
			"951826517535653918": { premiumUses: 6 }, // PREMIUM 6
			"951826481204580382": { premiumUses: 10 }, // PREMIUM 10
			"951826570249666560": { premiumUses: 15 }, // PREMIUM 15
		};

		const currentDate = new Date();
		const nextMonthDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			currentDate.getDate()
		);
		const expireDate = nextMonthDate.getTime();

		const user = newMember.user;
		const userSettings = await bot.getUserData(bot, user.id);

		if (userSettings.premium) return; // Skip if the user is already marked as premium

		for (const roleID in roleMappings) {
			if (newMember._roles.includes(roleID)) {
				const { premiumUses } = roleMappings[roleID];
				const premiumSettings = {
					premium: true,
					premiumExpireDate,
					premiumUses,
					userNAME: `${user.username}#${user.discriminator}`,
				};
				await bot.updateUserSettings(user.id, premiumSettings);
				break;
			}
		}
	}
}

module.exports = GuildMemberUpdate;
