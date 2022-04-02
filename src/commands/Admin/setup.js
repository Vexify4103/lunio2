// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed,
     Permissions
} = require("discord.js");

module.exports = class Setup extends Command {
     constructor(bot) {
          super(bot, {
               name: 'setup',
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'Setup the unique songrequest channel.',
               helpPerms: "Admin",
               cooldown: 2000,
               usage: 'setup',
               slash: true,
               options: [{
                    name: 'embed',
                    description: 'Setup the unique songrequest channel with the banner embedded.',
                    type: 5,
                    required: true,
               }]
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const guildId = guild.id;
          const player = bot.manager.players.get(guildId);
          const banner = interaction.options.getBoolean('embed');
          // IF ALREADY SETUP
          if (settings.CustomChannel) {
               const alreadyChannel = new MessageEmbed()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'Admin/setup:EMBED_ALREADY_SETUP', {
                         CHANNELID: settings.mChannelID
                    }))

               return interaction.reply({
                    embeds: [alreadyChannel],
                    ephemeral: true
               })
          }
          const createdChannel = await guild.channels.create('void-song-requests', {
               reason: "void-song-requests channel",
               type: "text",
               topic: ":play_pause: Pause/Resume the song. \n:stop_button: Stop and empty the queue. \n:track_next: Skip the song. \n:arrows_counterclockwise: Switch between the loop modes. \n:twisted_rightwards_arrows: Shuffle the queue. \n:star: Add the current song to your private playlist. \n:x: Remove the current song from your private playlist.",
               permissionOverwrites: [{
                    id: bot.user.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY], 
               }]
          })

          let title2 = bot.translate(settings.Language, 'Admin/setup:EMBED_CHANNEL_CREATED_TITLE')
          let success = new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setTitle(title2)
               .setDescription(bot.translate(settings.Language, 'Admin/setup:EMBED_CHANNEL_CREATED_DESC', {
                    CHANNELID: createdChannel.id
               }))

          interaction.reply({
               embeds: [success],
               ephemeral: true
          })

          if (!player) {
               return await createChannel(bot, settings, banner, createdChannel);
          } else {
               await createChannel(bot, settings, banner, createdChannel);
               return await bot.musicembed(bot, player, settings);
          }
          
          async function createChannel(bot, settings, banner, createdChannel) {
               if (banner) {
                    let bannerEmbed = new MessageEmbed()
                         .setColor(bot.config.color)
                         .setImage(bot.config.music_banner)

                    banner = await createdChannel.send({
                         embeds: [bannerEmbed]
                    })
               } else {
                    banner = await createdChannel.send({
                         files: ["../void_banner.png"]
                    })
               }

               let title = bot.translate(settings.Language, 'musicoff:TITLE');
               let footer = {
                    text: bot.translate(settings.Language, 'musicoff:FOOTER')
               };
               let musicembed = new MessageEmbed()
                         .setColor(bot.config.color)
                         .setTitle(title)
                         .setDescription(`[Invite](${bot.config.inviteLink}) | [Support](${bot.config.SupportServer.link})`)
                         .setFooter(footer)
                         .setImage(bot.config.no_music)

               await createdChannel.send({
                    content: `‏‏‎ \n__**${bot.translate(settings.Language, 'musicoff:QUEUE_LIST')}:**__ \n${bot.translate(settings.Language, 'musicoff:JOIN_AND_PLAY')}`,
                    embeds: [musicembed],
                    allowedMentions: {
                         repliedUser: false,
                         parse: ["everyone"]
                    },
               }).then(async x => {
                    await x.react('⏯️')
                    await x.react('⏹️')
                    await x.react('⏭️')
                    await x.react('🔄')
                    await x.react('🔀')
                    await x.react('⭐')
                    await x.react('❌')
                    let newsettings = {
                         CustomChannel: true,
                         mChannelID: createdChannel.id,
                         mChannelEmbedID: x.id,
                         mChannelBannerID: banner.id
                    }
                    await bot.updateGuildSettings(guildId, newsettings);
               })
               return;
          }
     }
};