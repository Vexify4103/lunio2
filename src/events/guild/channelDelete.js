const Event = require('../../structures/Event');
module.exports = class channelDelete extends Event {
     constructor(...args) {
          super(...args, {
               dirname: __dirname,
          });
     }
     async run(bot, channel) {
          let settings = await bot.getGuildData(bot, channel.guild.id);
          let irc = await bot.isrequestchannel(channel.id, settings);
          try {
               if (channel.type === "voice") {
                    if (channel.members.has(bot.user.id)) {
                         var player = bot.music.players.get(channel.guild.id)
                         if (!player) return;
                         if (channel.id === player.voiceChannel) {
                              if (irc) {
                                   await musicoff(bot, player, settings).catch((err) => {
                                        console.error(err)
                                   })
                                   return player.destroy()
                              } else {
                                   return player.destroy()
                              }
                         }
                    }
               }
               if (irc) {
                    var player = bot.manager.players.get(channel.guild.id)
                    let settingsREMOVE = {
                         CustomChannel: false,
                         mChannelID: "",
                         mChannelEmbedID: ""
                    }
                    if (!player) {
                         return await bot.updateGuildSettings(channel.guild.id, settingsREMOVE);
                    } else {
                         await bot.updateGuildSettings(channel.guild.id, settingsREMOVE);
                         let channeltosend;
                         let guild = channel.guild
                         guild.channels.cache.forEach((channel1) => {
                              if (channel1.type === "text" && !channeltosend && channel1.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                                   channeltosend = channel1
                              }
                         });

                         if (!channeltosend) return;
                         player.setTextChannel(channeltosend)
                         return;
                    }
               }
          } catch (err) {
               console.error(err)
          }
     }
}