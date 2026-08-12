const fs = require("fs-extra");
const moment = require("moment-timezone");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: "Customize bot prefix",
    longDescription: "Modify the bot's prefix for individual threads or globally (admin only).",
    category: "system",
    usePrefix: false,
    isPremium: false,
    guide: {
      en: `
        {pn} <new prefix>: Change the prefix for your chat box.
        Example: {pn} #

        {pn} <new prefix> -g: Change the prefix globally (admin only).
        Example: {pn} # -g

        {pn} reset: Reset prefix to the default.
      `
    }
  },

  langs: {
    en: {
      reset: "✅ Your prefix has been reset to default: %1",
      onlyAdmin: "• Only admins can modify the global prefix.",
      confirmGlobal: "• React below to confirm changing the global prefix.",
      confirmThisThread: "• React below to confirm changing the thread prefix.",
      successGlobal: "✅ Global prefix updated to: %1",
      successThisThread: "✅ Thread prefix has been updated to: %1",
    }
  },

  onStart: async function ({ message, role, args, event, threadsData, usersData, getLang }) {
    if (args.length === 0) {
      const data = await usersData.get(event.senderID);
      const name = data.name || "Darling";
      const currentTime = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
      return message.reply({
        body: `🪶 𝐇𝐞𝐲, ${name}!\n⚒️ Current Prefixes:
  🛸 𝐆𝐫𝐨𝐮𝐩 : ${utils.getPrefix(event.threadID)}
  🌏 𝐒𝐲𝐬𝐭𝐞𝐦 : ${global.GoatBot.config.prefix}\n🕒 Time: ${currentTime}\n`,
        mentions: [{ id: event.senderID, tag: name }]
      });
    }

    const newPrefix = args[0];
    const isGlobal = args[1] === "-g";

    if (newPrefix === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    if (isGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

    const confirmationMessage = isGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmationMessage, (err, info) => {
      global.GoatBot.onReaction.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        newPrefix,
        setGlobal: isGlobal,
        messageID: info.messageID
      });
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;

    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  }
};
