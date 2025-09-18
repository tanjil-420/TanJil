const fs = require("fs-extra");

module.exports = {
	config: {
		name: "restart",
		version: "1.3",
		author: "NTKhang (modified by ChatGPT)",
		countDown: 5,
		role: 2,
		description: "Restart bot",
		category: "Owner",
		guide: "{pn}: Restart bot"
	},

	langs: {
		en: {
			restarting: "🔄 Restarting bot, please wait...",
			restarted: "✅ Bot restarted successfully!\n⏰ Uptime: %ss"
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(
				this.langs.en.restarted.replace("%s", ((Date.now() - time) / 1000).toFixed(1)),
				tid
			);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event }) {
		const dirPath = `${__dirname}/tmp`;
		const pathFile = `${dirPath}/restart.txt`;

		// Ensure tmp folder exists
		fs.ensureDirSync(dirPath);

		// Write restart data
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

		// Reply to user
		await message.reply(this.langs.en.restarting);

		// Exit process
		process.exit(2);
	}
};
