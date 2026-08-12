const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "1.4",
		author: "NTKhang",
		envConfig: {
			allow: true
		},
		category: "events"
	},

	langs: {
		vi: {
			title: "📘 [ BOT LOGS ]",
			added: "\n✅ Bot đã được thêm vào một nhóm mới\n➤ Người thêm: %1",
			kicked: "\n❌ Bot đã bị xóa khỏi nhóm\n➤ Người kick: %1",
			footer: "\n\n➤ User ID: %1\n➤ Tên nhóm: %2\n➤ Nhóm ID: %3\n➤ Thời gian: %4"
		},
		en: {
			title: "⚡ Bot Group Status ",
			added: "\n✅ Bot has been added to a new group\n╰‣ Added by: %1",
			kicked: "\n❌ Bot has been removed from a group\n╰‣ Kicked by: %1",
			footer: "\n\n╰‣ User ID: %1\╰‣ Group Name: %2\n╰‣ Group ID: %3\╰‣ Time: %4"
		}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		const { author, threadID, logMessageType, logMessageData } = event;
		const botID = api.getCurrentUserID();

		const isBotAdded = logMessageType === "log:subscribe" && logMessageData.addedParticipants.some(item => item.userFbId == botID);
		const isBotKicked = logMessageType === "log:unsubscribe" && logMessageData.leftParticipantFbId == botID;

		if (!isBotAdded && !isBotKicked) return;

		if (author === botID) return;

		let msg = getLang("title");
		let threadName;
		const { config } = global.GoatBot;

		if (isBotAdded) {
			threadName = (await api.getThreadInfo(threadID)).threadName;
			const authorName = await usersData.getName(author);
			msg += getLang("added", authorName);
		} else if (isBotKicked) {
			const authorName = await usersData.getName(author);
			const threadData = await threadsData.get(threadID);
			threadName = threadData.threadName || "Unknown";
			msg += getLang("kicked", authorName);
		}

		const time = getTime("DD/MM/YYYY HH:mm:ss");
		msg += getLang("footer", author, threadName, threadID, time);

		for (const adminID of config.adminBot)
			api.sendMessage(msg, adminID);

		const customLogThreads = ['9191391594224159'];
		for (const thread of customLogThreads)
			api.sendMessage(msg, thread);
	}
};