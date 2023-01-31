// Dependencies
const { Message } = require("discord.js"),
	{ findBestMatch } = require("string-similarity");

module.exports = Object.defineProperties(Message.prototype, {
	args: {
		value: [],
		writable: true,
	},
	// Fetch the args from a message
	getArgs: {
		value: function () {
			const args = this.content.split(" ");
			args.shift();
			if (this.content.startsWith(`<@!${this.bot.user.id}>`))
				args.shift();

			// append it to message structure
			this.args = args;
			return args;
		},
	},
	// Get member(s) from message (via ID, mention or username)
	getMember: {
		value: async function () {
			const users = [];
			// add all mentioned users
			for (let i = 0; i < this.args.length; i++) {
				// eslint-disable-next-line no-empty-function
				if (
					this.mentions.members.array()[i] ||
					(await this.guild.members
						.fetch(this.args[i])
						.catch(() => {}))
				) {
					// eslint-disable-next-line no-empty-function
					users.push(
						this.mentions.members.array()[i] ||
							(await this.guild.members
								.fetch(this.args[i])
								.catch(() => {}))
					);
				}
			}
			// find user
			if (this.args[0]) {
				// fetch all members before search
				await this.guild.members.fetch();

				// search for members
				const members = [],
					indexes = [];
				this.guild.members.cache.forEach((member) => {
					members.push(member.user.username);
					indexes.push(member.id);
				});
				const match = findBestMatch(this.args.join(" "), members);
				if (match.bestMatch.rating >= 0.1) {
					const username = match.bestMatch.target,
						member = this.guild.members.cache.get(
							indexes[members.indexOf(username)]
						);
					users.push(member);
				}
			}
			// add author at the end
			users.push(this.member);
			return users;
		},
	},
	// Get channel(s) from message (via ID or mention)
	getChannel: {
		value: async function () {
			const channels = [];
			// get all channels mentioned
			for (let i = 0; i < this.args.length; i++) {
				if (
					this.mentions.channels.array()[i] ||
					this.guild.channels.cache.get(this.args[i])
				) {
					channels.push(
						this.mentions.channels.array()[i] ||
							this.guild.channels.cache.get(this.args[i])
					);
				}
			}
			channels.push(this.channel);
			return channels;
		},
	},
	// Get role(s) from message (via ID, mention or name)
	getRole: {
		value: function () {
			const roles = [];
			// get all channels mentioned
			for (let i = 0; i < this.args.length; i++) {
				if (
					this.mentions.roles.array()[i] ||
					this.guild.roles.cache.get(this.args[i])
				) {
					roles.push(
						this.mentions.roles.array()[i] ||
							this.guild.roles.cache.get(this.args[i])
					);
				}
			}
			if (this.args[0]) {
				const roleList = [];
				this.guild.roles.cache.forEach((r) => {
					roleList.push(r.name);
				});
				const match = findBestMatch(this.args.join(" "), roleList);
				if (match.bestMatch.rating != 0) {
					const username = match.bestMatch.target,
						role = this.guild.roles.cache.find(
							(r) => r.name == username
						);
					roles.push(role);
				}
			}
			// return the array of roles
			return roles;
		},
	},
	// Check if bot has permission to send custom emoji
	checkEmoji: {
		value: function () {
			if (this.channel.type == "dm") {
				return true;
			} else {
				return this.channel
					.permissionsFor(this.bot.user)
					.has("USE_EXTERNAL_EMOJIS")
					? true
					: false;
			}
		},
	},
	// Used for translating strings
	translate: {
		value: function (key, args) {
			const language = this.bot.translations.get(
				this.guild?.settings.Language ?? "en-US"
			);
			if (!language) return "Invalid language set in data.";
			return language(key, args);
		},
	},
	// Added timed message delete as djs v13 removed it.
	timedDelete: {
		value: function (obj) {
			setTimeout(() => {
				this.delete();
			}, obj.timeout || 3000);
		},
	},
});
