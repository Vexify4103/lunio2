// Dependencies
const { paginate } = require('../../utils'),
     Command = require('../../structures/Command.js');
const {
     MessageEmbed
} = require("discord.js");
const { getSong } = require("genius-lyrics-api")

module.exports = class Lyrics extends Command {
     constructor(bot) {
          super(bot, {
               name: 'lyrics',
               helpPerms: "Everyone",
               dirname: __dirname,
               botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
               description: 'Shows lyrics for the currently playing song.',
               cooldown: 2000,
               slash: true,
               premiumOnly: false,
               usage: 'lyrics',
               reqVote: true,
               reqplayer: false,
               reqvc: false,
               options: [{
                    name: 'song-title',
                    description: 'Shows lyrics for the provided song.',
                    type: 3,
                    required: false,
               },{
                    name: 'song-artist',
                    description: 'Helps searching the Lyrics for the Song',
                    type: 3,
                    required: false,
               }],
               methods: [{
                         name: '<song title>',
                         description: 'Shows lyrics for the provided song.',
                         perms: "Everyone"
                    },{
                         name: '<song title> + <song artist>',
                         description: 'Helps searching the Lyrics for the song.',
                         perms: "Everyone"
                    }
               ],
          });
     }
     // Function for slash command
     async callback(bot, interaction, guild, args, settings) {

          const member = guild.members.cache.get(interaction.user.id);
          const song = interaction.options.getString('song-title');
          const artist = interaction.options.getString('song-artits');
          const player = bot.manager?.players.get(guild.id);

          let options = {
               apiKey: bot.config.api_keys.genuis,
               optimizeQuery: true,
          }
          
          let title = bot.translate(settings.Language, 'Everyone/lyrics:LOADING_TITLE')
          let embed = new MessageEmbed()
               .setColor(await bot.getColor(bot, guild.id))
               .setTitle(title)
               .setDescription(bot.translate(settings.Language, 'Everyone/lyrics:LOADING_DESC'))

          interaction.reply({
               embeds: [embed],
               ephemeral: true
          })
          // IF NO TITLE CHECK FOR PLAYER
          if (!song || song == "null") {
               if (artist) {
                    let embed = new MessageEmbed()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'Everyone/lyrics:MISSING_SONGTITLE'))

                    return setTimeout(() => {
                         interaction.editReply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }, bot.ws.ping * 2) 
               }
               if (!player) {
                    let embed = new MessageEmbed()
                         .setColor(bot.config.colorWrong)
                         .setDescription(bot.translate(settings.Language, 'Everyone/lyrics:NO_PLAYER'))

                    return setTimeout(() => {
                         interaction.editReply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }, bot.ws.ping * 2) 
               } else {
                    options = {
                         apiKey: bot.config.api_keys.genuis,
                         title: player.queue.current.title,
                         artist: player.queue.current.author,
                         optimizeQuery: true,
                    };
               }
          } else {
               if (song && artist) {
                    options = {
                         apiKey: bot.config.api_keys.genuis,
                         title: song,
                         artist: artist,
                         optimizeQuery: true
                    }
               // IF ONLY TITLE IS GIVEN
               } else {
                    options = {
                         apiKey: bot.config.api_keys.genuis,
                         title: song,
                         optimizeQuery: true
                    }
               }
          }

          // display lyrics
		try {
			const lyrics = await this.searchLyrics(bot, guild, options, member.user, settings);
			if (Array.isArray(lyrics)) {
				paginate(bot, interaction, lyrics, member.id);
			} else {
                    let footerOptions = {
                         text: bot.translate(settings.Language, 'Everyone/lyrics:LYRICS_BY')
                    }
                    let embed = new MessageEmbed()
                         .setTitle(options.title)
                         .setThumbnail(bot.config.geniusapilogo)
                         .setColor(await bot.getColor(bot, guild.id))
                         .setDescription(`${lyrics}`)
                         .setFooter(footerOptions)

                    return setTimeout(() => {
                         interaction.editReply({
                              embeds: [embed],
                              ephemeral: true
                         })
                    }, bot.ws.ping * 2) 
			}
		} catch (error) {
               let embed = new MessageEmbed()
                    .setColor(bot.config.colorWrong)
                    .setDescription(bot.translate(settings.Language, 'Everyone/lyrics:ERROR'))

               return setTimeout(() => {
                    interaction.editReply({
                         embeds: [embed],
                         ephemeral: true
                    })
               }, bot.ws.ping * 2) 
		}

     }


     async searchLyrics(bot, guild, options, author, settings) {
		// search for and send lyrics
		const info = await getSong(options);

          let footerOptions = {
               text: bot.translate(settings.Language, 'Everyone/lyrics:LYRICS_BY')
          }
		// make sure lyrics were found
		if (!info || !info.lyrics) {
               var noly = bot.translate(settings.Language, 'Everyone/lyrics:NO_LYRICS_FOUND')
			return noly;
		}

		// create pages
		let pagesNum = Math.ceil(info.lyrics.length / 2048);
		if (pagesNum === 0) pagesNum = 1;

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const embed = new MessageEmbed()
				.setTitle(options.title)
                    .setThumbnail(bot.config.geniusapilogo)
                    .setColor(await bot.getColor(bot, guild.id))
				.setDescription(info.lyrics.substring(i * 2048, (i + 1) * 2048))
				.setFooter(footerOptions);

			pages.push(embed);
		}

		return pages;
	}
};