module.exports = (member, settings) => {
     const { channel } = member.voice;
     if (!channel) return false;
	// Check if the member has role to interact with music plugin
     if (settings.VCToggle) {
          if (settings.VCs.includes(channel.id)) {
               return true;
          } else {
               return false;
          }
     } else {
          return true;
     }
};