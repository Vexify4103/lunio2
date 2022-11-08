// Dependencies
const Command = require('../../structures/Command.js');
const {
     EmbedBuilder,
     Channel,
     ActionRowBuilder,
     ButtonBuilder,
     ButtonStyle
} = require("discord.js");

module.exports = class Test extends Command {
     constructor(bot) {
          super(bot, {
               name: 'test',
               adminOnly: true,
               userPermissions: ["ADMINISTRATOR"],
               description: 'TEST COMMAND',
               cooldown: 2000,
               slash: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          // const channel = await bot.channels.fetch('866678034298568745');
          // const msg = await channel.messages.fetch('948647803213721632');

          let embed = new EmbedBuilder()
               .setTitle('TEST TITLE')
               .setDescription('TEST DESCRIPTION FOR TEST')
               .setColor(bot.config.colorWrong)

          //▶️⏸️⏭️⏹️🔄🔀
          let components = [
               new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('999694402966519878').setCustomId('play-pause'),
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

          return interaction.reply({
               embeds: [embed],
               components: components
          })
     }
};