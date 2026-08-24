const { getDiamond, setDiamond } = require("../utils/dataStore");

module.exports = {
  config: {
    name: "diamond",
    aliases: ["dm", "dia"],
    version: "3.0.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "game",
    description: "Manage virtual diamonds",
    guide: {
      en:
        "{pn} - View your diamonds\n" +
        "{pn} @user - View user's diamonds\n" +
        "{pn} transfer @user <amount> - Transfer diamonds\n" +
        "{pn} add @user <amount> - Admin add diamonds\n" +
        "{pn} delete @user <amount> - Admin remove diamonds"
    }
  },

  onStart: async function ({
    message,
    usersData,
    event,
    args
  }) {
    const senderID = String(event.senderID);
    const botConfig = global.GoatBot.config;

    const adminIDs = Array.isArray(botConfig.adminBot)
      ? botConfig.adminBot.map(String)
      : [String(botConfig.adminBot)];

    const command = String(args[0] || "").toLowerCase();

    const units = {
      k: 1e3,
      m: 1e6,
      b: 1e9,
      t: 1e12,
      q: 1e15,
      qi: 1e18,
      sx: 1e21,
      sp: 1e24,
      oc: 1e27,
      n: 1e30,
      d: 1e33
    };

    const parseAmount = value => {
      if (value === undefined || value === null) return null;

      const match = String(value)
        .toLowerCase()
        .match(
          /^(\d+(?:\.\d+)?)(k|m|b|t|qi|q|sx|sp|oc|n|d)?$/
        );

      if (!match) return null;

      const number = parseFloat(match[1]);
      const unit = match[2] || "";

      const amount = number * (units[unit] || 1);

      if (!Number.isFinite(amount) || amount <= 0) {
        return null;
      }

      return amount;
    };

    const formatDiamond = value => {
      let number = Number(value) || 0;

      const names = [
        "",
        "K",
        "M",
        "B",
        "T",
        "Q",
        "Qi",
        "Sx",
        "Sp",
        "Oc",
        "N",
        "D"
      ];

      let unit = 0;

      while (
        number >= 1000 &&
        unit < names.length - 1
      ) {
        number /= 1000;
        unit++;
      }

      return `${number.toFixed(2)}${names[unit]}💎`;
    };

    const getUserName = async uid => {
      try {
        const user = await usersData.get(String(uid));
        return user?.name || "User";
      } catch {
        return "User";
      }
    };

    const getTargetUID = () => {
      if (event.messageReply?.senderID) {
        return String(event.messageReply.senderID);
      }

      if (
        event.mentions &&
        Object.keys(event.mentions).length
      ) {
        return String(Object.keys(event.mentions)[0]);
      }

      for (const arg of args.slice(1)) {
        if (/^\d+$/.test(arg)) {
          return String(arg);
        }
      }

      return null;
    };

    const getAmount = () => {
      for (let i = args.length - 1; i >= 1; i--) {
        const amount = parseAmount(args[i]);

        if (amount !== null) {
          return amount;
        }
      }

      return null;
    };

    /* ================= HELP ================= */

    if (command === "help") {
      return message.reply(
        `╭━━━〔 💎 DIAMOND SYSTEM 〕━━━╮\n` +
        `┃\n` +
        `┃ 💎 ${botConfig.prefix}dm\n` +
        `┃ View your diamonds\n` +
        `┃\n` +
        `┃ 👤 ${botConfig.prefix}dm @user\n` +
        `┃ View user's diamonds\n` +
        `┃\n` +
        `┃ 🔁 ${botConfig.prefix}dm transfer @user 500\n` +
        `┃ Transfer diamonds\n` +
        `┃\n` +
        `┃ ➕ ${botConfig.prefix}dm add @user 500\n` +
        `┃ Admin: Add diamonds\n` +
        `┃\n` +
        `┃ ➖ ${botConfig.prefix}dm delete @user 500\n` +
        `┃ Admin: Remove diamonds\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    /* ================= ADMIN ADD ================= */

    if (command === "add") {
      if (!adminIDs.includes(senderID)) {
        return message.reply(
          "❌ You don't have permission to use this command."
        );
      }

      const targetUID = getTargetUID();
      const amount = getAmount();

      if (!targetUID) {
        return message.reply(
          "❌ Please mention a user, reply to a user, or provide UID."
        );
      }

      if (amount === null) {
        return message.reply(
          "❌ Please provide a valid amount.\nExample: 500, 10K, 2.5M"
        );
      }

      const current = getDiamond(targetUID);
      const newBalance = current + amount;

      setDiamond(targetUID, newBalance);

      const name = await getUserName(targetUID);

      return message.reply(
        `╭━━━〔 💎 DIAMONDS ADDED 〕━━━╮\n` +
        `┃\n` +
        `┃ 👤 ${name}\n` +
        `┃ ➕ Added: ${formatDiamond(amount)}\n` +
        `┃ 💎 Balance: ${formatDiamond(newBalance)}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    /* ================= ADMIN DELETE ================= */

    if (command === "delete") {
      if (!adminIDs.includes(senderID)) {
        return message.reply(
          "❌ You don't have permission to use this command."
        );
      }

      const targetUID = getTargetUID();
      const amount = getAmount();

      if (!targetUID) {
        return message.reply(
          "❌ Please mention a user, reply to a user, or provide UID."
        );
      }

      if (amount === null) {
        return message.reply(
          "❌ Please provide a valid amount."
        );
      }

      const current = getDiamond(targetUID);

      if (current < amount) {
        return message.reply(
          `❌ Insufficient diamonds.\n` +
          `💎 Current Balance: ${formatDiamond(current)}`
        );
      }

      const newBalance = current - amount;

      setDiamond(targetUID, newBalance);

      const name = await getUserName(targetUID);

      return message.reply(
        `╭━━━〔 💎 DIAMONDS REMOVED 〕━━━╮\n` +
        `┃\n` +
        `┃ 👤 ${name}\n` +
        `┃ ➖ Removed: ${formatDiamond(amount)}\n` +
        `┃ 💎 Balance: ${formatDiamond(newBalance)}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    /* ================= TRANSFER ================= */

    if (command === "transfer") {
      const targetUID = getTargetUID();
      const amount = getAmount();

      if (!targetUID) {
        return message.reply(
          "❌ Please mention the receiver or reply to them."
        );
      }

      if (amount === null) {
        return message.reply(
          "❌ Please provide a valid amount."
        );
      }

      if (targetUID === senderID) {
        return message.reply(
          "❌ You cannot transfer diamonds to yourself."
        );
      }

      const senderBalance = getDiamond(senderID);

      if (senderBalance < amount) {
        return message.reply(
          `❌ You don't have enough diamonds.\n` +
          `💎 Your Balance: ${formatDiamond(senderBalance)}`
        );
      }

      const receiverBalance = getDiamond(targetUID);

      setDiamond(
        senderID,
        senderBalance - amount
      );

      setDiamond(
        targetUID,
        receiverBalance + amount
      );

      const name = await getUserName(targetUID);

      return message.reply(
        `╭━━━〔 💎 TRANSFER SUCCESS 〕━━━╮\n` +
        `┃\n` +
        `┃ 👤 Receiver: ${name}\n` +
        `┃ 💎 Amount: ${formatDiamond(amount)}\n` +
        `┃ 💰 Your Balance: ${formatDiamond(senderBalance - amount)}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    /* ================= VIEW ================= */

    let targetUID = senderID;

    if (event.messageReply?.senderID) {
      targetUID = String(event.messageReply.senderID);
    } else if (
      event.mentions &&
      Object.keys(event.mentions).length
    ) {
      targetUID = String(
        Object.keys(event.mentions)[0]
      );
    } else if (/^\d+$/.test(command)) {
      targetUID = command;
    }

    const balance = getDiamond(targetUID);
    const name = await getUserName(targetUID);

    return message.reply(
      `╭━━━〔 💎 DIAMOND BALANCE 〕━━━╮\n` +
      `┃\n` +
      `┃ 👤 Name: ${name}\n` +
      `┃ 💎 Diamonds: ${formatDiamond(balance)}\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  }
};
