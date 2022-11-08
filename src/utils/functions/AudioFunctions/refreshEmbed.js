const {
     EmbedBuilder,
     Channel,
     Permissions,
     ActionRowBuilder,
     ButtonBuilder,
     ButtonStyle
} = require("discord.js");
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration)

module.exports = async (bot, settings) => {
     if (!settings || !settings.CustomChannel) return;
     const channel = await bot.channels.fetch(settings.mChannelID);
     const message = await channel.messages.fetch(settings.mChannelEmbedID);

     const date1 = dayjs(Date.now())
     const date2 = dayjs(message.createdTimestamp)

     const diff = date1.diff(date2, 'minutes');
     if (diff > 1) {
          console.log("diff")
          let components = [
               new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694402966519878').setCustomId('play'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694406321963068').setCustomId('skip'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694397337776171').setCustomId('clear'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694398579277886').setCustomId('loop'),
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694405218865172').setCustomId('shuffle'),
               ]),
               new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Add to Playlist').setCustomId('atp'),
                    new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Remove from Playlist').setCustomId('rfp'),
               ])
          ]

          let title = bot.translate(settings.Language, 'musicoff:TITLE');
          let footer = {
               text: bot.translate(settings.Language, 'musicoff:FOOTER')
          };
          let musicembed = new EmbedBuilder()
               .setColor(bot.config.color)
               .setTitle(title)
               .setDescription(`[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`)
               .setFooter(footer)
               .setImage(bot.config.no_music)

          if (message?.deletable) await message.delete().catch(e => bot.logger.error(`Error deleting message in refreshEmbed.js ${e}`))

          await channel.send({
               content: `‏‏‎ \n__**${bot.translate(settings.Language, 'musicoff:QUEUE_LIST')}:**__ \n${bot.translate(settings.Language, 'musicoff:JOIN_AND_PLAY')}`,
               embeds: [musicembed],
               components: components,
               allowedMentions: {
                    repliedUser: false,
                    parse: ["everyone"]
               },
          }).then(async x => {
               let newsettings = {
                    mChannelEmbedID: x.id,
               }
               await bot.updateGuildSettings(message.guildId, newsettings);
          })
     }
     console.log("no diff")
};