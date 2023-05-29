const config = require("../../../config");
const url = config.inviteLink;

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
				? [
						`[${line.repeat((size / 2) * 2)}](${url})`,
						(currenttime / maxtime) * 100,
				  ]
				: [
						`[${line.repeat(
							Math.round((size / 2) * (currenttime / maxtime))
						)}${slider}](${url})${line.repeat(
							size - Math.round(size * (currenttime / maxtime))
						)}`,
						currenttime / maxtime,
				  ];
		if (!bar[0].includes(slider))
			return `**[${slider}${line.repeat(size - 1)}](${url})**`;
		return `${bar[0]}`;
	} catch (e) {
		console.log(e);
	}
};
