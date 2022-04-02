module.exports = async (bot, ms) => {
	try {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(2);
            }, ms);
          });
        } catch (e) {
          bot.logger.error(`Error delaying event: ${e}`)
        }
};