// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder,
     ActionRowBuilder,
     ButtonBuilder,
     ButtonStyle
} = require("discord.js");
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration)

module.exports = class Premium extends Command {
     constructor(bot) {
          super(bot, {
               name: 'premium',
               helpPerms: "Everyone",
               dirname: __dirname,
               description: 'See and manage your premium subscription.',
               slash: true,
               usage: 'premium status',
               music: false,
               reqplayer: false,
               reqvc: false,
               options: [{
                    // COMMAND #1
                    name: 'status',
                    description: 'Show the user and server premium status.',
                    type: 1,
               }, {
                    // COMMAND #2 / PREMIUM
                    name: 'upgrade',
                    description: 'Upgrade 1 server to premium.',
                    type: 1,
                    options: [{
                         name: 'server-id',
                         description: 'ID of the server you want to be upgraded.',
                         type: 3,
                         required: true,
                    }]
               }],
               methods: [{
                    name: 'upgrade <server-id>',
                    description: 'ID of the server you want to be upgraded.',
                    perms: 'Premium'
               }],
          });
     }

     async callback(bot, interaction, guild, args, settings) {
          const member = await guild.members.fetch(interaction.user.id);
          let userSettings = await bot.getUserData(bot, member.user.id);
          const Sub = interaction.options.getSubcommand(["status", "upgrade"]);
          const ID = interaction.options.getString('server-id');

          let supportServer = await bot.guilds.fetch('866666289178869770');
          const Supporter = '951804516490174514';
          const Premium1 = '951807454553976903';
          const Premium3 = '951809000062738462';
          const Premium6 = '951826517535653918';
          const Premium10 = '951826481204580382';
          const Premium15 = '951826570249666560';

          const linkRow = new ActionRowBuilder()
               .addComponents(
                    new ButtonBuilder()
                         .setURL(bot.config.premiumLink)
                         .setLabel('Premium')
                         .setStyle(ButtonStyle.Link),

                    new ButtonBuilder()
                         .setURL(bot.config.premiumLink)
                         .setLabel('Premium')
                         .setStyle(ButtonStyle.Link)
               )
               
          switch (Sub) {
               case "status":
                    let user;
                    try {
                         user = await supportServer.members.fetch(member.user.id);
                    } catch (error) {
                         let embed = new EmbedBuilder()
                              .setColor(bot.config.colorOrange)
                              .setDescription(settings.Language, 'Everyone/premium:EMBED_MANAGE_PREMIUM', {
                                   SUPPORTSERVER: bot.config.SupportServer.link,
                                   CONNECTLINK: bot.config.connectLink
                              })

                         return interaction.reply({
                              embeds: [embed],
                              components: [linkRow],
                              ephemeral: true
                         })
                    }
                    let userSubscription;
                    if (!userSettings.premium) {
                         userSubscription = bot.translate(settings.Language, 'Everyone/premium:NO_PREMIUM')
                    } else {
                         if (user._roles.includes(Supporter)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:SUPPORTER_PREMIUM')
                         } else if (user._roles.includes(Premium1)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:1_SERVER_PREMIUM')
                         } else if (user._roles.includes(Premium3)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:3_SERVER_PREMIUM')
                         } else if (user._roles.includes(Premium6)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:6_SERVER_PREMIUM')
                         } else if (user._roles.includes(Premium10)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:10_SERVER_PREMIUM')
                         } else if (user._roles.includes(Premium15)) {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:15_SERVER_PREMIUM')
                         } else {
                              userSubscription = bot.translate(settings.Language, 'Everyone/premium:NO_PREMIUM')
                         }
                    }
                    let embed2 = new EmbedBuilder()
                         .setColor(await bot.getColor(bot, guild.id))

                    let usesLeft = userSettings.premiumUses;

                    if (settings.permpremium) {
                         embed2.setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_PERMPREMIUM', {
                              USERSUBSCRIPTION: `${bot.codeBlock(userSubscription)}`,
                              USESLEFT: usesLeft,
                              PREMIUMLINK: bot.config.premiumLink,
                              SUPPORTSERVER: bot.config.SupportServer.link
                         }))
                    } else {
                         embed2.setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_NORMALPREMIUM', {
                              USERSUBSCRIPTION: `${bot.codeBlock(userSubscription)}`,
                              USESLEFT: `${bot.codeBlock(usesLeft)}`,
                              PREMIUMSTATUS: `${bot.codeBlock(settings.premium ? `Promoted` : `Not Promoted`)}`,
                              PREMIUMLINK: bot.config.premiumLink,
                              SUPPORTSERVER: bot.config.SupportServer.link
                         }))
                    
                    }

                    return interaction.reply({
                         embeds: [embed2],
                         components: [linkRow],
                         ephemeral: true
                    });
               case "upgrade": //ID required
                    let embed;
                    if (!userSettings.premium) {
                         embed = new EmbedBuilder()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_PREMIUM_REQUIRED'))

                         return interaction.reply({
                              embeds: [embed],
                              components: [linkRow],
                              ephemeral: true
                         })
                    }
                    if (userSettings.premiumUses === 0) {
                         embed = new EmbedBuilder()
                              .setColor(bot.config.colorOrange)
                              .setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_NO_USES_LEFT'))

                         return interaction.reply({
                              embeds: [embed],
                              components: [linkRow],
                              ephemeral: true
                         })
                    }
                    let server;
                    try {
                         server = await bot.guilds.fetch(ID);
                    } catch (error) {
                         embed = new EmbedBuilder()
                              .setColor(bot.config.colorWrong)
                              .setDescription(`Could not find a guild by the ID: ${bot.codeBlock(ID)}.`)
                              .setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_NO_GUILDID', {
                                   ID: `${bot.codeBlock(ID)}`
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }
                    if (server) {
                         let serverSettings = await bot.getGuildData(bot, server.id);

                         if (serverSettings.premium || serverSettings.permpremium) {
                              embed = new EmbedBuilder()
                                   .setColor(bot.config.colorOrange)
                                   .setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_GUILD_ALREADY_PREMIUM'))

                              return interaction.reply({
                                   embeds: [embed],
                                   components: [linkRow],
                                   ephemeral: true
                              })
                         }

                         let newUserSettings = {
                              premiumUses: userSettings.premiumUses - 1,
                         }
                         await bot.updateUserSettings(interaction.user, newUserSettings);

                         const date = dayjs().add(dayjs.duration({
                              'months': 1
                         }));

                         let newGuildSettings = {
                              premium: true,
                              expireDate: date.$d
                         }

                         await bot.updateGuildSettings(server.id, newGuildSettings);

                         embed = new EmbedBuilder()
                              .setColor(bot.config.colorTrue)
                              .setDescription(bot.translate(settings.Language, 'Everyone/premium:EMBED_SUCCESS_UPGRADE', {
                                   SERVERNAME: `${bot.codeBlock(server.name)}`,
                                   PREMIUMUSESLEFT: `${bot.codeBlock(userSettings.premiumUses - 1)}`
                              }))

                         return interaction.reply({
                              embeds: [embed],
                              components: [linkRow],
                              ephemeral: true
                         })
                    }

                    break;

               default:
                    break;
          }
     }
};