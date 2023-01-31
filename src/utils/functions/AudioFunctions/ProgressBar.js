module.exports = (
	maxtime,
	currenttime,
	size = 25,
	line = "▬",
	slider = "🔘"
) => {
	try {
		let bar =
			currenttime > maxtime
				? [line.repeat((size / 2) * 2), (currenttime / maxtime) * 100]
				: [
						line
							.repeat(
								Math.round((size / 2) * (currenttime / maxtime))
							)
							.replace(/.$/, slider) +
							line.repeat(
								size -
									Math.round(size * (currenttime / maxtime)) +
									1
							),
						currenttime / maxtime,
				  ];
		if (!String(bar).includes("🔘"))
			return `**🔘${line.repeat(size - 1)}**`;
		return `${bar[0]}`;
	} catch (e) {
		console.log(e);
	}
};
