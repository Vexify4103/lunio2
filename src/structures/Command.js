// Dependencies
const path = require("path");

// Command structure
class Command {
	constructor(
		bot,
		{
			name = null,
			guildOnly = false,
			dirname = false,
			aliases = new Array(),
			userPermissions = new Array(),
			helpPerms = "",
			nsfw = false,
			ownerOnly = false,
			premiumOnly = false,
			adminOnly = false,
			prv = false,
			music = false,
			reqplayer = false,
			reqvc = false,
			cooldown = 3000,
			description = "",
			slash = false,
			options = new Array(),
			methods = new Array(),
			defaultPermission = true,
			usage = "",
			reqVote = false,
			flags = new Array(),
			default_member_permissions = null,
		}
	) {
		const category = dirname
			? dirname.split(path.sep)[
					parseInt(dirname.split(path.sep).length - 1, 10)
			  ]
			: "Other";
		this.conf = {
			default_member_permissions,
			guildOnly,
			userPermissions,
			nsfw,
			ownerOnly,
			premiumOnly,
			adminOnly,
			prv,
			music,
			reqplayer,
			reqvc,
			cooldown,
			slash,
			options,
			methods,
			defaultPermission,
			helpPerms,
			usage,
			reqVote,
			flags,
		};
		this.help = {
			name,
			category,
			aliases,
			description,
			options,
			methods,
			helpPerms,
			usage,
			reqVote,
			flags,
		};
	}

	// eslint-disable-next-line no-unused-vars
	async run(...args) {
		throw new Error(
			`Command: ${this.help.name} does not have a run method`
		);
	}

	async callback() {
		throw new Error(
			`Command: ${this.help.name} does not have a callback method`
		);
	}
}

module.exports = Command;
