// Dependencies
const Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
module.exports = class Language extends Command {
     constructor(bot) {
          super(bot, {
               name: 'language',
               adminOnly: true,
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               userPermissions: ["ADMINISTRATOR"],
               description: 'Set the language on your server.',
               cooldown: 2000,
               helpPerms: "Admin",
               usage: 'language set',
               slash: true,
               options: [{
                    name: "set",
                    description: "Set the language on your server.",
                    type: 1,
                    options: [{
                         name: "language-key",
                         description: "Set the language on your server. (language keys visble with '/language list')",
                         required: true,
                         type: 3
                    }]
               }, {
                    name: "list",
                    description: "List all available languages.",
                    type: 1
               }],
               methods: [{
                    name: "list",
                    description: "List all available languages."
               }]
          });
     }
     async callback(bot, interaction, guild, args, settings) {
          const Sub = interaction.options.getSubcommand(["set", "list"]);
          let embed;
          const language = interaction.options.getString('language-key')
          const languageList = [
               // {
               //      name: "ar",
               //      translation: "عربي"
               // },
               // {
               //      name: "cs",
               //      translation: "Čeština"
               // },
               // {
               //      name: "de",
               //      translation: "deutsch"
               // },
               {
                    name: "en-US",
                    translation: "English"
               },
               // {
               //      name: "es-ES",
               //      translation: "Español"
               // },
               // {
               //      name: "fa",
               //      translation: "انگلیسی"
               // },
               // {
               //      name: "fr",
               //      translation: "Française"
               // },
               // {
               //      name: "hi",
               //      translation: "हिंदी"
               // },
               // {
               //      name: "hr",
               //      translation: "Hrvatski"
               // },
               // {
               //      name: "hu",
               //      translation: "Magyar"
               // },
               // {
               //      name: "id",
               //      translation: "Bahasa Indonesia"
               // },
               // {
               //      name: "it",
               //      translation: "italiano"
               // },
               // {
               //      name: "ja",
               //      translation: "日本語"
               // },
               // {
               //      name: "ko",
               //      translation: "한국어"
               // },
               // {
               //      name: "lv",
               //      translation: "Latvietis"
               // },
               // {
               //      name: "nl",
               //      translation: "Nederlands"
               // },
               // {
               //      name: "pl",
               //      translation: "Polski"
               // },
               // {
               //      name: "pt_BR",
               //      translation: "Português Brasileiro"
               // },
               // {
               //      name: "ru",
               //      translation: "Русский"
               // },
               // {
               //      name: "sv_SE",
               //      translation: "Svenska"
               // },
               // {
               //      name: "th",
               //      translation: "ภาษาไทย"
               // },
               // {
               //      name: "tr",
               //      translation: "Türkçe"
               // },
               // {
               //      name: "vi",
               //      translation: "Tiếng Việt"
               // },
               // {
               //      name: "zh-TW",
               //      translation: "繁體中文"
               // }
          ]

          switch (Sub) {
               case "set":
                    let obj = languageList.find(ln => ln.name === language)

                    if (!obj) {
                         embed = new MessageEmbed()
                              .setColor(bot.config.colorWrong)
                              .setDescription(bot.translate(settings.Language, 'Admin/language:EMBED_INVALID_LANGUAGE'))

                         return interaction.reply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }

                    let newSettings = {
                         Language: obj.name
                    }
                    await bot.updateGuildSettings(guild.id, newSettings);

                    embed = new MessageEmbed()
                         .setColor(bot.config.color)
                         .setDescription(bot.translate(obj.name, 'Admin/language:EMBED_LANGUAGE_SET', {
                              LANGUAGE: obj.name
                         }))

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               case "list":
                    const str = []
                    for (let i = 0; i < languageList.length; i++) {
                         str.push(`${bot.codeBlock(languageList[i].name)} - ${languageList[i].translation}`)
                    }
                    let footer = bot.translate(settings.Language, 'Admin/language:EMBED_AVAILABLE_LANGUAGES_FOOTER')
                    embed = new MessageEmbed()
                         .setColor(bot.config.colorOrange)
                         .setDescription(`**__${bot.translate(settings.Language, 'Admin/language:EMBED_AVAILABLE_LANGUAGES')}__**\n${str.join("\n")}\n\n${bot.translate(settings.Language, 'Admin/language:EMBED_AVAILABLE_LANGUAGES_2', { LINK: bot.config.translationLink })}`)
                         .setFooter({
                              text: footer
                         })

                    return interaction.reply({
                         embeds: [embed],
                         ephemeral: true
                    })
               default:
                    break;
          }

     }
};