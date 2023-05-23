const { logger } = require("../../../utils");

const messageTimeouts = new Map();

function setTimeoutId(messageId, timeoutId) {
	messageTimeouts.set(messageId, timeoutId);
}

function clearTimeoutId(messageId) {
	const timeoutId = messageTimeouts.get(messageId);
	if (timeoutId) {
		clearTimeout(timeoutId);
		logger.log(
			`Deleted timeout for messageId: ${messageId} with timeoutId: ${timeoutId}`
		);
		messageTimeouts.delete(messageId);
	}
}

function clearTimeoutByMessageId(messageId) {
	clearTimeoutId(messageId);
}


module.exports = { setTimeoutId, clearTimeoutId, clearTimeoutByMessageId };
