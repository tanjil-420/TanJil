const { getUser, setUser } = require("../utils/dataStore");

module.exports = {
  config: {
    name: "jackpot",
    version: "4.0",
    author: "T A N J I L 🎀",
    shortDescription: { en: "jackpot game with multipliers" },
    longDescription: { en: "Place a bet and win between 1.0× to 3.0× with 7% win chance!" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ Invalid bet amount. Use like: 1K, 10M, or just a number like 1000.",
      not_enough_money: "⚠️ You don't have enough money to place this bet.",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const input = args[0]?.toLowerCase();

    if (!input) {
      return message.reply("⚠️ Please provide your bet amount. Example: /jackpot 1M");
    }

    function parseAmount(str) {
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
        dc: 1e33
      };

      const regex = /^(\d+(\.\d+)?)([a-z]{0,2})$/;
      const match = str.match(regex);

      if (!match) return null;

      const [_, num, __, unit] = match;
      const multiplier = units[unit.toLowerCase()] || 1;

      return parseFloat(num) * multiplier;
    }

    const bet = parseAmount(input);

    if (!bet || bet < 1) {
      return message.reply(getLang("invalid_amount"));
    }

    const userData = await getUser(usersData, senderID);
    let balance = Number(userData.money || 0);

    if (balance < bet) {
      return message.reply(getLang("not_enough_money"));
    }

    const name = userData.name || "User";

    let win = false;
    let winAmount = 0;
    let finalMultiplier = 1.0;

    const chance = Math.random();

    if (chance <= 0.3) {
      win = true;
      finalMultiplier = parseFloat((Math.random() * 2 + 1).toFixed(1));
      winAmount = bet * finalMultiplier;
      balance += winAmount;
    } else {
      winAmount = -bet;
      balance += winAmount;
    }

    await setUser(usersData, senderID, {
      money: balance
    });

    const format = (n) => {
      if (n >= 1e33) return (n / 1e33).toFixed(2) + "Dc";
      if (n >= 1e30) return (n / 1e30).toFixed(2) + "N";
      if (n >= 1e27) return (n / 1e27).toFixed(2) + "Oc";
      if (n >= 1e24) return (n / 1e24).toFixed(2) + "Sp";
      if (n >= 1e21) return (n / 1e21).toFixed(2) + "Sx";
      if (n >= 1e18) return (n / 1e18).toFixed(2) + "Qi";
      if (n >= 1e15) return (n / 1e15).toFixed(2) + "Q";
      if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
      return Number(n).toFixed(2);
    };

    const result =
      `╭──────────────\n` +
      `│\n` +
      `│     ✨${name}✨\n` +
      `│\n` +
      `│   ${win ? "🎀 YoU WiN 🎀" : "💔 YoU LoST 💔"}\n` +
      `│  your bet amount : $${format(bet)}\n` +
      `│  your balance : $${format(balance)}\n` +
      `│\n` +
      `╰──────────────`;

    return message.reply(result);
  }
};
