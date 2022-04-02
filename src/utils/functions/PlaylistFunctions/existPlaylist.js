const {
     PlaylistSchema
} = require('../../../database/models')

module.exports = async (userId, playlistName) => {
     if (!playlistName || playlistName == "null") {
          return false;
     }
     try {
          let exist = await PlaylistSchema.findOne({
               name: playlistName,
               creator: userId
          })

          if (!exist) {
               return false;
          } else {
               return true;
          }
     } catch (error) {
          return false;
     }
};