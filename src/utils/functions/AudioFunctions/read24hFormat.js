module.exports = (text) => {
	// set values to 0
	let j, k, ms;
	j = k = ms = 0;

	if (!text) return 0;
	const result = text.split(/:/);

	// if time is xx:xx:xx instead of xx:xx
	if (result.length === 3) result.push('00');

	for (let i = result.length - 1; i >= 0; i--) {
		k = Math.abs(parseInt(result[i]) * 1000 * Math.pow(60, j < 3 ? j : 2));
		j++;
		ms += k;
	}
	if (isFinite(ms)) {
		return ms;
	} else {
		throw new TypeError('Final value is greater than Number can hold.');
	}
};