// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder
} = require("discord.js");
module.exports = class TwentyFourSeven extends Command {
     constructor(bot) {
          super(bot, {
               name: '247',
               adminOnly: true,
               premiumOnly: true,
               dirname: __dirname,
               description: 'Toggle the bot to stay 24/7 in the voice channel.',
               cooldown: 2000,
               helpPerms: "Premium, Admin",
               usage: '24/7 <on/off>',
               slash: true,
               reqvc: true,
               reqplayer: true,
               options: [{
                    name: 'toggle',
                    description: 'Toggle the bot to stay 24/7 in the voice channel.',
                    type: 3,
                    required: true,
                    choices: [{
                         name: 'on',
                         value: 'on'
                    }, {
                         name: 'off',
                         value: 'off'
                    }]
               }],
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          const choice = interaction.options.getString('toggle');
          const TwentyFourSeven = player?.twentyFourSeven;
          let embed;

          if (choice === 'on') {
               if (TwentyFourSeven) {
                    embed = new EmbedBuilder()
                         .setColor(bot.config.colorOrange)
                         .setDescription(bot.translate(settings.Language, 'Premium/247:EMBED_247_ALREADY_TOGGLE', {
                              TOGGLE: `${bot.codeBlock(choice)}`
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               }
               player.twentyFourSeven = true;

               embed = new EmbedBuilder()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'Premium/247:EMBED_247_ACTIVATED'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
          if (choice === 'off') {
               if (!TwentyFourSeven) {
                    embed = new EmbedBuilder()
                         .setColor(bot.config.colorOrange)
                         .setDescription(bot.translate(settings.Language, 'Premium/247:EMBED_247_ALREADY_TOGGLE', {
                              TOGGLE: `${bot.codeBlock(choice)}`
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               }
               player.twentyFourSeven = false;

               embed = new EmbedBuilder()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'Premium/247:EMBED_247_DEACTIVATED'))

               if (!player.queue.current) player.destroy()
               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
     }
};