module.exports = (duration) => {
	(seconds = Math.floor((duration / 1000) % 60)),
		(minutes = Math.floor((duration / (1000 * 60)) % 60)),
		(hours = Math.floor((duration / (1000 * 60 * 60)) % 24));

	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	if (hours >= 1) {
		return hours + ":" + minutes + ":" + seconds;
	} else {
		return minutes + ":" + seconds;
	}
};
