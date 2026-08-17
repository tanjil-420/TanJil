module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.5",
		author: "NTKhang + TanJil 🎀",
		countDown: 5,
		role: 1,
		description: {
			vi: "bật/tắt chế độ chỉ quản trị của viên nhóm mới có thể sử dụng bot",
			en: "turn on/off only admin box can use bot"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [on | off]: bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot"
				+ "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot"
				+ "\n   {pn} -a [on | off]: bật/tắt chế độ tất cả các nhóm cùng lúc",
			en: "   {pn} [on | off]: turn on/off only admin of group can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
				+ "\n   {pn} -a [on | off]: turn on/off mode for all groups at once"
		}
	},

	langs: {
		vi: {
			turnedOn: "✅ Đã bật chế độ chỉ quản trị viên sử dụng bot trong nhóm này",
			turnedOff: "✅ Đã tắt chế độ chỉ quản trị viên sử dụng bot trong nhóm này",
			turnedOnNoti: "✅ Đã bật thông báo khi người không phải quản trị viên dùng bot",
			turnedOffNoti: "✅ Đã tắt thông báo khi người không phải quản trị viên dùng bot",
			syntaxError: "❌ Sai cú pháp! Dùng: on / off hoặc noti on / off hoặc -a on / off",
			doneAll: "✅ Đã áp dụng chế độ cho tất cả nhóm thành công"
		},
		en: {
			turnedOn: "✅ Enabled: Only admins can use bot in this group",
			turnedOff: "✅ Disabled: Everyone can use bot in this group",
			turnedOnNoti: "✅ Notification enabled for non-admin bot usage",
			turnedOffNoti: "✅ Notification disabled for non-admin bot usage",
			syntaxError: "❌ Syntax error! Use: on / off or noti on / off or -a on / off",
			doneAll: "✅ Successfully applied to all groups"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		const ownerUID = "61564913640716";
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		// Global apply
		if (args[0] === "-a") {
			if (!["on", "off"].includes(args[1])) return message.reply(getLang("syntaxError"));
			value = args[1] === "on";
			const allThreads = await threadsData.getAll();
			for (const thread of allThreads) {
				if (!thread?.threadID) continue;
				await threadsData.set(thread.threadID, value, "data.onlyAdminBox");
			}
			return message.reply(getLang("doneAll"));
		}

		// Noti toggle
		if (args[0] === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] === "on") value = true;
		else if (args[indexGetVal] === "off") value = false;
		else return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);
		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	},

	onChat: async function ({ event, threadsData, role }) {
		const ownerUID = "61564913640716";

		// 
		if (event.senderID == ownerUID) return false;

		const threadData = await threadsData.get(event.threadID);
		const isAdminOnly = threadData?.data?.onlyAdminBox;
		const hideNoti = threadData?.data?.hideNotiMessageOnlyAdminBox;

		if (!isAdminOnly) return false;
		if (role === 1 || role === 2) return false;

		// 
		if (!hideNoti) {
			return {
				body: "⚠️ Bot is in 'Only Admin' mode. You are not allowed to use commands."
			};
		}

		return true; // 
	}
};
