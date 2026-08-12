module.exports = {
	config: {
		name: "kick",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			en: "Kick member out of chat box!"
		},
		category: "box chat",
		guide: {
			en: `{pn} @mention - kick mentioned user(s)
{pn} uid - kick by UID
{pn} name - search by name and show list
{pn} all - kick all search results
{pn} (reply to message) - kick the replied user`
		}
	},

	langs: {
		en: {
			needAdmin: "× Please add admin for bot before using this feature",
			cannotKickSelf: "× You cannot kick yourself!",
			cannotKickProtected: "× Shut up nonsense, I can't kick my owner!",
			noUserFound: "× No user found with that name!",
			selectNumber: "#• Found %1 user(s). Reply with number(s) separated by space or 'all' to kick:\n%2",
			kickedSuccess: "#• Successfully kicked: %1",
			kicking: "#• Kicking users...",
			invalidNumber: "× Invalid selection!",
			kickAllConfirm: "× Are you sure you want to kick ALL %1 users? Reply 'yes' to confirm.",
			operationCancelled: "× Operation cancelled.",
			errorKicking: "× Error kicking some users: %1",
			replyTimeout: "× Selection timeout. Please search again.",
			noActiveSearch: "× No active search found. Please search again."
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang, usersData }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		const botID = api.getCurrentUserID();
		const protectedUIDs = ["100049220893428", "100000975454984", "100007806468843"];

		if (!adminIDs.includes(botID)) 
			return message.reply(getLang("needAdmin"));

		async function kickUser(uid) {
			if (uid === botID || uid === event.senderID) {
				return { success: false, reason: "self" };
			}
			if (protectedUIDs.includes(uid)) {
				return { success: false, reason: "protected" };
			}
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				const user = await usersData.get(uid);
				return { success: true, name: user?.name || uid };
			} catch (e) {
				return { success: false, reason: "error", error: e };
			}
		}

		if (args[0] && !isNaN(args[0])) {
			const uid = args[0];
			const result = await kickUser(uid);
			if (!result.success) {
				if (result.reason === "self") return message.reply(getLang("cannotKickSelf"));
				if (result.reason === "protected") return message.reply(getLang("cannotKickProtected"));
				return message.reply(getLang("needAdmin"));
			}
			return message.reply(getLang("kickedSuccess", result.name));
		}

		if (event.type === "message_reply" && !args[0]) {
			const uid = event.messageReply.senderID;
			const result = await kickUser(uid);
			if (!result.success) {
				if (result.reason === "self") return message.reply(getLang("cannotKickSelf"));
				if (result.reason === "protected") return message.reply(getLang("cannotKickProtected"));
				return message.reply(getLang("needAdmin"));
			}
			return message.reply(getLang("kickedSuccess", result.name));
		}

		if (Object.keys(event.mentions).length > 0) {
			const uids = Object.keys(event.mentions);
			const kicked = [];
			const errors = [];

			for (const uid of uids) {
				const result = await kickUser(uid);
				if (result.success) {
					kicked.push(result.name);
				} else {
					if (result.reason === "protected") 
						errors.push(`${event.mentions[uid]}: Owner protected`);
					else if (result.reason === "self")
						errors.push(`${event.mentions[uid]}: Cannot kick yourself`);
				}
			}

			let reply = "";
			if (kicked.length > 0) 
				reply += getLang("kickedSuccess", kicked.join(", ")) + "\n";
			if (errors.length > 0) 
				reply += getLang("errorKicking", errors.join(", "));
			
			return message.reply(reply || "No users were kicked.");
		}

		if (args[0] && isNaN(args[0]) && args[0].toLowerCase() !== "all") {
			const searchName = args.join(" ").toLowerCase();
			const threadInfo = await api.getThreadInfo(event.threadID);
			const participants = threadInfo.participantIDs;
			
			const matches = [];
			for (const uid of participants) {
				const user = await usersData.get(uid);
				if (user && user.name && user.name.toLowerCase().includes(searchName)) {
					if (uid !== event.senderID && !protectedUIDs.includes(uid)) {
						matches.push({ uid, name: user.name });
					}
				}
			}

			if (matches.length === 0) 
				return message.reply(getLang("noUserFound"));

			matches.sort((a, b) => a.name.localeCompare(b.name));

			let list = "";
			matches.forEach((user, index) => {
				list += `${index + 1}. ${user.name} (${user.uid})\n`;
			});

			global.ctcKickData = global.ctcKickData || {};
			global.ctcKickData[event.senderID] = {
				matches: matches,
				time: Date.now(),
				threadID: event.threadID
			};

			return message.reply(getLang("selectNumber", matches.length, list), (err, info) => {
				if (err) return;

				global.GoatBot.onReply.set(info.messageID, {
					commandName: module.exports.config.name,
					type: "reply",
					messageID: info.messageID,
					author: event.senderID
				});
			});
		}

		if (args[0] && (args[0].toLowerCase() === "all" || !isNaN(args[0]))) {
			if (!global.ctcKickData || !global.ctcKickData[event.senderID]) 
				return message.reply(getLang("noActiveSearch"));

			const { matches } = global.ctcKickData[event.senderID];
			delete global.ctcKickData[event.senderID];

			if (args[0].toLowerCase() === "all") {
				if (args[1]?.toLowerCase() !== "yes") {
					return message.reply(getLang("kickAllConfirm", matches.length), (err, info) => {
						if (err) return;

						global.GoatBot.onReply.set(info.messageID, {
							commandName: module.exports.config.name,
							type: "reply",
							messageID: info.messageID,
							author: event.senderID
						});
					});
				}

				const kicked = [];
				const errors = [];

				await message.reply(getLang("kicking"));
				
				for (const user of matches) {
					const result = await kickUser(user.uid);
					if (result.success) {
						kicked.push(user.name);
					} else {
						errors.push(`${user.name}: ${result.reason}`);
					}
					await new Promise(resolve => setTimeout(resolve, 500));
				}

				let reply = "";
				if (kicked.length > 0) 
					reply += getLang("kickedSuccess", kicked.join(", ")) + "\n";
				if (errors.length > 0) 
					reply += getLang("errorKicking", errors.join(", "));
				
				return message.reply(reply || "No users were kicked.");
			} else {
				const numbers = args[0].split(/[, ]+/).map(num => parseInt(num.trim()));
				
				const invalidNumbers = numbers.filter(num => num < 1 || num > matches.length);
				if (invalidNumbers.length > 0) 
					return message.reply(getLang("invalidNumber"));

				const kicked = [];
				const errors = [];

				for (const num of numbers) {
					const user = matches[num - 1];
					if (user) {
						const result = await kickUser(user.uid);
						if (result.success) {
							kicked.push(user.name);
						} else {
							if (result.reason === "protected") 
								errors.push(`${user.name}: Owner protected`);
							else if (result.reason === "self")
								errors.push(`${user.name}: Cannot kick yourself`);
						}
					}
				}

				let reply = "";
				if (kicked.length > 0) 
					reply += getLang("kickedSuccess", kicked.join(", ")) + "\n";
				if (errors.length > 0) 
					reply += getLang("errorKicking", errors.join(", "));
				
				return message.reply(reply || "No users were kicked.");
			}
		}

		return message.SyntaxError();
	},

	onReply: async function ({ event, message, Reply, args, threadsData, api, getLang, usersData }) {
		const { author: commandAuthor } = Reply;
		
		if (event.senderID !== commandAuthor) 
			return;

		if (!global.ctcKickData || !global.ctcKickData[event.senderID]) 
			return message.reply(getLang("noActiveSearch"));

		const { matches, time, threadID } = global.ctcKickData[event.senderID];
		
		if (Date.now() - time > 5 * 60 * 1000) {
			delete global.ctcKickData[event.senderID];
			return message.reply(getLang("replyTimeout"));
		}

		if (event.threadID !== threadID) return;

		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		const botID = api.getCurrentUserID();
		const protectedUIDs = ["100049220893428", "100000975454984", "100007806468843"];

		if (!adminIDs.includes(botID)) {
			delete global.ctcKickData[event.senderID];
			return message.reply(getLang("needAdmin"));
		}

		async function kickUser(uid) {
			if (uid === botID || uid === event.senderID) {
				return { success: false, reason: "self" };
			}
			if (protectedUIDs.includes(uid)) {
				return { success: false, reason: "protected" };
			}
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				const user = await usersData.get(uid);
				return { success: true, name: user?.name || uid };
			} catch (e) {
				return { success: false, reason: "error", error: e };
			}
		}

		const input = args[0]?.toLowerCase();

		if (input === "all") {
			if (args[1]?.toLowerCase() !== "yes") {
				return message.reply(getLang("kickAllConfirm", matches.length), (err, info) => {
					if (err) return;

					global.GoatBot.onReply.set(info.messageID, {
						commandName: module.exports.config.name,
						type: "reply",
						messageID: info.messageID,
						author: event.senderID
					});
				});
			}

			delete global.ctcKickData[event.senderID];

			const kicked = [];
			const errors = [];

			await message.reply(getLang("kicking"));
			
			for (const user of matches) {
				const result = await kickUser(user.uid);
				if (result.success) {
					kicked.push(user.name);
				} else {
					errors.push(`${user.name}: ${result.reason}`);
				}
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			let reply = "";
			if (kicked.length > 0) 
				reply += getLang("kickedSuccess", kicked.join(", ")) + "\n";
			if (errors.length > 0) 
				reply += getLang("errorKicking", errors.join(", "));
			
			return message.reply(reply || "No users were kicked.");
		}

		const numbers = args.join(" ").split(/[, ]+/).map(num => parseInt(num.trim()));
		
		if (numbers.length === 0 || numbers.some(isNaN)) {
			return message.reply(getLang("invalidNumber"));
		}

		const invalidNumbers = numbers.filter(num => num < 1 || num > matches.length);
		if (invalidNumbers.length > 0) 
			return message.reply(getLang("invalidNumber"));

		delete global.ctcKickData[event.senderID];

		const kicked = [];
		const errors = [];

		for (const num of numbers) {
			const user = matches[num - 1];
			if (user) {
				const result = await kickUser(user.uid);
				if (result.success) {
					kicked.push(user.name);
				} else {
					if (result.reason === "protected") 
						errors.push(`${user.name}: Owner protected`);
					else if (result.reason === "self")
						errors.push(`${user.name}: Cannot kick yourself`);
					else
						errors.push(`${user.name}: Error`);
				}
			}
		}

		let reply = "";
		if (kicked.length > 0) 
			reply += getLang("kickedSuccess", kicked.join(", ")) + "\n";
		if (errors.length > 0) 
			reply += getLang("errorKicking", errors.join(", "));
		
		if (Reply.messageID) {
			try {
				await api.unsendMessage(Reply.messageID);
			} catch (e) {
			}
		}
		
		return message.reply(reply || "No users were kicked.");
	}
};