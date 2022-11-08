// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder
} = require("discord.js");

module.exports = class Resume extends Command {
     constructor(bot) {
          super(bot, {
               name: 'resume',
               helpPerms: "DJ",
               dirname: __dirname,
               description: 'Resumes the current paused song.',
               slash: true,
               usage: 'resume',
               music: true,
               reqplayer: true,
               reqvc: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;


          if (!player.paused) {
               embed = new EmbedBuilder()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'DJ/resume:EMBED_ALREADY_RESUMED'))

               return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

          player.pause(false);

          embed =  new EmbedBuilder()
               .setColor(await bot.getColor(bot, guild.id))
               .setDescription(bot.translate(settings.Language, 'DJ/resume:EMBED_RESUMED_SONG'))

               
          interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
          if (settings.CustomChannel) await bot.musicembed(bot, player, settings);
          return;
     }
};