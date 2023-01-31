// Dependencies
const Command = require("../../structures/Command.js");
const { EmbedBuilder } = require("discord.js");
module.exports = class Bassboost extends Command {
  constructor(bot) {
    super(bot, {
      name: "volume",
      adminOnly: true,
      premiumOnly: true,
      dirname: __dirname,
      description: "Lets you change the bots output volume.",
      cooldown: 2000,
      helpPerms: "Premium, DJ",
      usage: "volume 1-200",
      slash: true,
      reqvc: false,
      reqplayer: false,
      options: [
        {
          name: "value",
          description: "The value of the new volume.",
          type: 4,
          required: false,
          min_value: 1,
          max_value: 200,
        },
        {
          name: "default",
          description: "Lets you change the bots default output volume.",
          type: 4,
          required: false,
          min_value: 1,
          max_value: 200,
        },
      ],
    });
  }
  async callback(bot, interaction, guild, args, settings) {
    const player = bot.manager?.players?.get(guild.id);
    const value = interaction.options.getInteger("value");
    const def = interaction.options.getInteger("default");
    let member = await guild.members.fetch(interaction.user.id);
    let embed;

    //console.log(player);

    // IF NO INPUT
    if (!value && !def) {
      let embed = new EmbedBuilder()
        .setColor(bot.config.colorOrange)
        .setDescription(`Volume is at ${bot.codeBlock(player?.volume ? player?.volume : settings.DefaultVol)}\nDefault volume is set to ${bot.codeBlock(settings.DefaultVol)}`
        );

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // CHANGE NORMAL VOLUME OF PLAYER
    if (value && !def) {
      if (!player) {
        let embed = new EmbedBuilder()
          .setColor(bot.config.colorWrong)
          .setDescription(bot.translate(settings.Language, 'slashCreate:BOT_NOT_PLAYING'))

        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        })
      }
      if (!member.voice.channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'slashCreate:USER_NOT_VC'))

				return interaction.reply({
					embeds: [embed],
					ephemeral: true
				})
			}
			if (player && (member.voice.channel.id !== player.voiceChannel)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'slashCreate:PLAYING_DIFFERENT_VC'))

				return interaction.reply({
					embeds: [embed],
					ephemeral: true
				})
			}

      await player.setVolume(value);

      await bot.musicembed(bot, player, settings);

      embed = new EmbedBuilder()
        .setColor(await bot.getColor(bot, guild.id))
        .setDescription(`Volume is now set to ${bot.codeBlock(value)}`);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (!value && def) {
      embed = new EmbedBuilder()
        .setColor(await bot.getColor(bot, guild.id))
        .setDescription(`Default volume is not set to ${bot.codeBlock(def)}`);

      let newSettings = {
        DefaultVol: def,
      };

      await bot.updateGuildSettings(guild.id, newSettings);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (value && def) {
      if (!player) {
        let embed = new EmbedBuilder()
          .setColor(bot.config.colorWrong)
          .setDescription(bot.translate(settings.Language, 'slashCreate:BOT_NOT_PLAYING'))

        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        })
      }
      if (!member.voice.channel) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'slashCreate:USER_NOT_VC'))

				return interaction.reply({
					embeds: [embed],
					ephemeral: true
				})
			}
			if (player && (member.voice.channel.id !== player.voiceChannel)) {
				let embed = new EmbedBuilder()
					.setColor(bot.config.colorOrange)
					.setDescription(bot.translate(settings.Language, 'slashCreate:PLAYING_DIFFERENT_VC'))

				return interaction.reply({
					embeds: [embed],
					ephemeral: true
				})
			}

      let newSettings = {
        DefaultVol: def,
      };

      
      await player.setVolume(value);
      
      await bot.updateGuildSettings(guild.id, newSettings);
      await bot.musicembed(bot, player, settings);

      let embed = new EmbedBuilder()
        .setColor(await bot.getColor(bot, guild.id))
        .setDescription(`Volume is now set to ${bot.codeBlock(value)}\nDefault volume is not set to ${bot.codeBlock(def)}`)

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      })
    }
  }
};
