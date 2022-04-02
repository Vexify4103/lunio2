module.exports = (member, settings) => {
     let has = [];
	// Check if the member has role to interact with music plugin
     if (settings.MusicDJ) {
          for (let i = 0; i < settings.MusicDJRole.length; i++) {
               if (member.roles.cache.has(`${settings.MusicDJRole[i]}`)) has.push(settings.MusicDJRole[i])
          }
          if (has.length > 0) {
               return true;
          } else {
               return false;
          }
     } else {
          return true;
     }
};