const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "2.0",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 1,
    description: {
      en: "Globally ban a user from using the bot"
    },
    category: "system",
    guide: {
      en: "{pn} [@tag|uid|link fb|reply] [reason] : Ban a user from using the bot globally\n"
        + "{pn} unban [@tag|uid|link fb|reply] : Unban user\n"
        + "{pn} list : Show banned users"
    }
  },

  langs: {
    en: {
      notFoundTarget: "⚠️ Please tag the user or provide uid/link/reply to ban.",
      notFoundTargetUnban: "⚠️ Please tag the user or provide uid/link/reply to unban.",
      userNotBanned: "⚠️ The user with id %1 is not banned.",
      unbannedSuccess: "✅ Successfully unbanned %1.",
      cantSelfBan: "⚠️ You cannot ban yourself.",
      existedBan: "❌ This user is already banned!",
      noReason: "No reason provided",
      bannedSuccess: "✅ Banned %1 from using the bot globally.",
      noName: "Facebook User",
      noData: "📑 No banned users found.",
      listBanned: "📑 List of banned users (page %1/%2)",
      content: "%1/ %2 (%3)\nReason: %4\nTime: %5\n\n",
    }
  },

  // Command (ban/unban/list)
  onStart: async function ({ message, event, args, usersData, globalData, getLang }) {
    const { senderID } = event;
    let target;
    let reason;

    const bannedUsers = await globalData.get("bannedUsers", []);

    if (args[0] == "unban") {
      if (!isNaN(args[1])) target = args[1];
      else if (args[1]?.startsWith("https")) target = await findUid(args[1]);
      else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
      else if (event.messageReply?.senderID) target = event.messageReply.senderID;
      else return message.reply(getLang("notFoundTargetUnban"));

      const index = bannedUsers.findIndex(item => item.id == target);
      if (index == -1) return message.reply(getLang("userNotBanned", target));

      bannedUsers.splice(index, 1);
      await globalData.set("bannedUsers", bannedUsers);
      const userName = await usersData.getName(target) || getLang("noName");

      return message.reply(getLang("unbannedSuccess", userName));
    }
    else if (args[0] == "list") {
      if (!bannedUsers.length) return message.reply(getLang("noData"));
      const limit = 20;
      const page = parseInt(args[1] || 1) || 1;
      const start = (page - 1) * limit;
      const end = page * limit;
      const data = bannedUsers.slice(start, end);
      let msg = "";
      let count = 0;
      for (const user of data) {
        count++;
        const name = await usersData.getName(user.id) || getLang("noName");
        msg += getLang("content", start + count, name, user.id, user.reason, user.time);
      }
      return message.reply(getLang("listBanned", page, Math.ceil(bannedUsers.length / limit)) + "\n\n" + msg);
    }

    // Ban logic
    if (event.messageReply?.senderID) {
      target = event.messageReply.senderID;
      reason = args.join(" ");
    }
    else if (Object.keys(event.mentions || {}).length) {
      target = Object.keys(event.mentions)[0];
      reason = args.join(" ").replace(event.mentions[target], "");
    }
    else if (!isNaN(args[0])) {
      target = args[0];
      reason = args.slice(1).join(" ");
    }
    else if (args[0]?.startsWith("https")) {
      target = await findUid(args[0]);
      reason = args.slice(1).join(" ");
    }

    if (!target) return message.reply(getLang("notFoundTarget"));
    if (target == senderID) return message.reply(getLang("cantSelfBan"));

    const banned = bannedUsers.find(item => item.id == target);
    if (banned) return message.reply(getLang("existedBan"));

    const name = await usersData.getName(target) || getLang("noName");
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");
    const data = {
      id: target,
      time,
      reason: reason || getLang("noReason"),
      bannedBy: await usersData.getName(senderID) || "Unknown"
    };

    bannedUsers.push(data);
    await globalData.set("bannedUsers", bannedUsers);
    return message.reply(getLang("bannedSuccess", name));
  },

  // Middleware: Block banned users
  onChat: async function ({ event, message, globalData }) {
    const bannedUsers = await globalData.get("bannedUsers", []);
    const banned = bannedUsers.find(item => item.id == event.senderID);
    if (banned && event.body?.toLowerCase().startsWith("baby")) {
      return message.reply(
        `🚫 You have been banned from using this bot.\n` +
        `Reason: ${banned.reason}\n` +
        `Banned by: ${banned.bannedBy}\n` +
        `Time: ${banned.time}`
      );
    }
  }
};
