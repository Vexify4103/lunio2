// Dependencies
const Command = require('../../structures/Command.js');
const {
     paginate
} = require('../../utils');
const {
     MessageEmbed
} = require("discord.js");

module.exports = class Voteskip extends Command {
     constructor(bot) {
          super(bot, {
               name: 'voteskip',
               helpPerms: "Everyone",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Lets you vote for skipping the current track.',
               slash: true,
               usage: 'voteskip',
               music: true,
               reqplayer: true,
               reqvc: true,
          });
     }

     // Function for message command
     // Function for slash command
     async callback(bot, interaction, guild, args, settings) {
          const player = bot.manager.players.get(guild.id);
          let embed;

          // skipSong = ['USEERID1', 'USERID2']
          if (player.skipSong.includes(interaction.user.id)) {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Everyone/voteksip:EMBED_ALREADY_VOTED'))

               return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }
          player.voteSkip(interaction.user.id);

          let userInVC = interaction.member.voice.channel.members.size - 1;
          let required = Math.ceil(userInVC / 2);
          if (player.skipSong.length >= required) {
               await player.stop()
               embed = new MessageEmbed()
                    .setColor(await bot.getColor(bot, guild.id))
                    .setDescription(bot.translate(settings.Language, 'Everyone/voteskip:EMBED_SKIPPED_TRACK'))

               return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          } else {
               embed = new MessageEmbed()
                    .setColor(bot.config.colorOrange)
                    .setDescription(bot.translate(settings.Language, 'Everyone/votekip:EMBED_VOTING_REQUIRED', {
                         size: player.skipSong.length,
                         required: required
                    }))

               return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
               })
          }

     }
};