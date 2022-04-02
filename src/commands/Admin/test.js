// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed,
     Channel,
     MessageActionRow,
     MessageButton
} = require("discord.js");

module.exports = class Test extends Command {
     constructor(bot) {
          super(bot, {
               name: 'test',
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'TEST COMMAND',
               cooldown: 2000,
               slash: true,
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          // const channel = await bot.channels.fetch('866678034298568745');
          // const msg = await channel.messages.fetch('948647803213721632');

          // let embed = new MessageEmbed()
          //      .setTitle('TEST TITLE')
          //      .setDescription('TEST DESCRIPTION FOR TEST')
          //      .setColor(bot.config.colorWrong)

          // // channel.send({
          // //      embeds: [embed]
          // // })
          // msg.reply({
          //      embeds: [embed]
          // })
          const member = await guild.members.fetch(interaction.user.id);
          // member.user = CustomUser data
          // interaction.user = CustomUser data from author
          let embed;

          let value = 123;
          embed = new MessageEmbed()
               .setColor(bot.config.color)
               .setDescription(bot.translate(settings.Language, 'Admin/test:TEST', { NUM: value }))

          return interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
     }
};