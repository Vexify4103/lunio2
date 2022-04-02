// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Ping extends Command {
     constructor(bot) {
          super(bot, {
               name: 'ping',
               helpPerms: "Everyone",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Shows the latency of the bot.',
               cooldown: 2000,
               slash: true,
               usage: 'ping',
               options: [{
                    name: 'type',
                    description: 'Shows the latency of the bot',
                    type: 3,
                    required: false,
                    choices: [{
                              name: 'websocket',
                              value: 'ws',
                         },{
                              name: 'rest',
                              value: 'rst'
                         },
                         {
                              name: 'database',
                              value: 'dtb',
                         },
                    ],
               }],
               methods: [{
                         name: 'ws',
                         description: 'Shows the websocket latency of the bot.',
                         perms: "Everyone"
                    },{
                         name: 'rest',
                         description: 'Shows the rest latency of the bot.',
                         perms: 'Everyone'
                    },
                    {
                         name: 'database',
                         description: 'Shows the latency of the database.',
                         perms: "Everyone"
                    }
               ],
          });
     }
     async callback(bot, interaction, guild, args) {

          let Ping = new MessageEmbed()

          const type = interaction.options.getString('type');
          let ms = bot.codeBlock(Math.round(bot.ws.ping) + "ms");
          let mongoosePing = await bot.mongoose.ping();
          let ms2 = bot.codeBlock(Math.round(mongoosePing) + "ms");
          if (!type || type == "ws") {
               if (Math.round(bot.ws.ping) < 150) {
                    Ping.setColor("#00FF55")
                    Ping.setDescription(`🟢 ${ms}`)
               } else if (Math.round(bot.ws.ping) >= 200 && Math.round(bot.ws.ping) <= 399) {
                    Ping.setColor("#FFD800")
                    Ping.setDescription(`🟠 ${ms}`)
               } else if (Math.round(bot.ws.ping) > 400) {
                    Ping.setColor("#FF3A00")
                    Ping.setDescription(`🔴 ${ms}`)
               }
               return await bot.send(interaction, {
                    embeds: [Ping],
                    ephemeral: true
               });
          }
          if (type == 'rst') {
               const channel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel);

               const Pinging = new MessageEmbed()
                    .setAuthor({ name: 'Running ping command', iconURL: bot.user.displayAvatarURL({ format: 'png' })})
                    .setColor(bot.config.colorOrange)
                    .addField('guildID', guild.id)
                    .addField('userID', interaction.user.id)
                    .setTimestamp();

               const m = await channel.send({ embeds: [Pinging]})
               const resttime = m.createdTimestamp - interaction.createdTimestamp
               if (resttime < 150) {
                    Ping.setColor("#00FF55")
                    Ping.setDescription(`🟢 ${resttime}`)
               } else if (resttime >= 200 && resttime <= 399) {
                    Ping.setColor("#FFD800")
                    Ping.setDescription(`🟠 ${resttime}`)
               } else if (resttime > 400) {
                    Ping.setColor("#FF3A00")
                    Ping.setDescription(`🔴 ${resttime}`)
               }
               return await bot.send(interaction, {
                    embeds: [Ping],
                    ephemeral: true
               });
          }
          if (type == "dtb") {
               if (mongoosePing < 100) {
                    Ping.setColor("#00FF55")
                    Ping.setDescription(`🟢 ${ms2}`)
               } else if (mongoosePing >= 100 && mongoosePing <= 299) {
                    Ping.setColor("#FFD800")
                    Ping.setDescription(`🟠 ${ms2}`)
               } else if (mongoosePing > 300) {
                    Ping.setColor("#FF3A00")
                    Ping.setDescription(`🔴 ${ms2}`)
               }
               return await bot.send(interaction, {
                    embeds: [Ping],
                    ephemeral: true
               });
          }
     }
};