module.exports = (duration) => {
	const seconds = Math.floor((duration / 1000) % 60);
	const minutes = Math.floor((duration / (1000 * 60)) % 60);
	let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	hours = hours < 10 ? "0" + hours : hours;
	const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
	const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

	if (hours >= 1) {
		return hours + ":" + formattedMinutes + ":" + formattedSeconds;
	} else {
		return formattedMinutes + ":" + formattedSeconds;
	}
};
