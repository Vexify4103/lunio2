// Dependencies
const Command = require("../../structures/Command.js");
const {
  EmbedBuilder,
  Channel,
  Permissions,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

module.exports = class Setup extends Command {
  constructor(bot) {
    super(bot, {
      name: "setup",
      adminOnly: true,
      dirname: __dirname,
      description: "Setup the unique songrequest channel.",
      helpPerms: "Admin",
      cooldown: 2000,
      usage: "setup",
      slash: true,
      options: [
        {
          name: "embed",
          description:
            "Setup the unique songrequest channel with the banner embedded.",
          type: 5,
          required: true,
        },
      ],
    });
  }
  async callback(bot, interaction, guild, args, settings) {
    const guildId = guild.id;
    const player = bot.manager.players.get(guildId);
    const banner = interaction.options.getBoolean("embed");
    // IF ALREADY SETUP
    if (settings.CustomChannel) {
      const alreadyChannel = new EmbedBuilder()
        .setColor(bot.config.colorOrange)
        .setDescription(
          bot.translate(settings.Language, "Admin/setup:EMBED_ALREADY_SETUP", {
            CHANNELID: settings.mChannelID,
          })
        );

      return interaction.reply({
        embeds: [alreadyChannel],
        ephemeral: true,
      });
    }

    let components = [
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("999694402966519878")
          .setCustomId("play"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("999694406321963068")
          .setCustomId("skip"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("999694397337776171")
          .setCustomId("clear"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("999694398579277886")
          .setCustomId("loop"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("999694405218865172")
          .setCustomId("shuffle"),
      ]),
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setLabel("Add to Playlist")
          .setCustomId("atp"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel("Remove from Playlist")
          .setCustomId("rfp"),
      ]),
    ];
    let options = {
      name: "lunio-song-requests channel",
      type: ChannelType.GuildText,
      topic:
        "<:play:999694402966519878> Pause/Resume the song. \n<:clear:999694397337776171> Stop and empty the queue. \n<:skip:999694406321963068> Skip the song. \n<:loop:999694398579277886> Switch between the loop modes. \n<:shuffle:999694405218865172> Shuffle the queue. \n<:add:999694395978821713> Add the current song to your private playlist. \n<:remove:999694404128362577> Remove the current song from your private playlist.",
      permissionOverwrites: [
        {
          id: bot.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.ManageMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    };
    const createdChannel = await guild.channels.create(options);
    //console.log(createdChannel)

    let title2 = bot.translate(
      settings.Language,
      "Admin/setup:EMBED_CHANNEL_CREATED_TITLE"
    );
    let success = new EmbedBuilder()
      .setColor(await bot.getColor(bot, guild.id))
      .setTitle(title2)
      .setDescription(
        bot.translate(
          settings.Language,
          "Admin/setup:EMBED_CHANNEL_CREATED_DESC",
          {
            CHANNELID: createdChannel.id,
          }
        )
      );

    interaction.reply({
      embeds: [success],
      ephemeral: true,
    });

    await createChannel(bot, settings, banner, createdChannel);
    if (player) await bot.musicembed(bot, player, settings);
    return;

    async function createChannel(bot, settings, banner, createdChannel) {
      if (banner) {
        let bannerEmbed = new EmbedBuilder()
          .setColor(bot.config.color)
          .setImage(bot.config.music_banner);

        banner = await createdChannel.send({
          embeds: [bannerEmbed],
        });
      } else {
        banner = await createdChannel.send({
          // // files: ["../banner.png"] //lunio
          // files: ["../banner2.png"], //lunio 2
          files: [
            {
              // attachment: "../banner.png" //lunio
              attachment: "../banner2.png", //lunio 2
            },
          ],
        });
      }

      let title = bot.translate(settings.Language, "musicoff:TITLE");
      let footer = {
        text: bot.translate(settings.Language, "musicoff:FOOTER"),
      };
      let musicembed = new EmbedBuilder()
        .setColor(bot.config.color)
        .setTitle(title)
        .setDescription(
          `[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`
        )
        .setFooter(footer)
        .setImage(bot.config.no_music);

      await createdChannel
        .send({
          content: `‏‏‎ \n__**${bot.translate(
            settings.Language,
            "musicoff:QUEUE_LIST"
          )}:**__ \n${bot.translate(
            settings.Language,
            "musicoff:JOIN_AND_PLAY"
          )}`,
          embeds: [musicembed],
          components: components,
          allowedMentions: {
            repliedUser: false,
            parse: ["everyone"],
          },
        })
        .then(async (x) => {
          let newsettings = {
            CustomChannel: true,
            mChannelID: createdChannel.id,
            mChannelEmbedID: x.id,
            mChannelBannerID: banner.id,
          };
          await bot.updateGuildSettings(guildId, newsettings);
        });
    }
  }
};
