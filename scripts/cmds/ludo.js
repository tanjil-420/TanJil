const {
  getUser,
  setUser
} = require("../utils/dataStore");

module.exports = {
  config: {
    name: "ludo",
    aliases: ["dice", "roll", "ludu", "lodo"],
    description: "Play a dice game and win coins by guessing the correct number!",
    usage: "/ludo <number 1-6> [bet amount]",
    category: "game",
    cooldown: 5,
    role: 0,
    author: "T A N J I L 🎀",
    shortDescription: {
      en: "Guess the dice number and win coins!"
    },
    longDescription: {
      en: "Use /ludo <1-6> to guess a dice number. If your guess is correct, you win coins. You can bet a custom amount or play the default mode."
    },
    guide: {
      en: `
✪ Ludo Dice Game Guide ✪

➤ Description:
Play a fun dice game by guessing a number from 1 to 6. Win coins if your guess matches the dice result.

➤ Usage:
• /ludo <number 1-6>
• /ludo <number 1-6> <betAmount>

➤ Example:
• /ludo 4
• /ludo 2 1000

➤ Rewards:
• Custom bet: Win 2× your bet if correct.
• Default mode: Win 1 Trillion if correct, lose 500 Billion if wrong.

➤ Notes:
• Only numbers from 1 to 6 are accepted.
• Make sure you have enough balance when placing a bet.
      `
    }
  },

  onStart: async function ({ event, args, message, usersData }) {
    const userID = event.senderID;
    const choice = Number(args[0]);
    const betAmount = args[1] ? Number(args[1]) : null;

    if (!Number.isInteger(choice) || choice < 1 || choice > 6) {
      return message.reply(
        `╭━━━〔 🎲 L U D O 〕━━━╮\n` +
        `┃\n` +
        `┃ ⚠️ Choose a number from 1 to 6.\n` +
        `┃\n` +
        `┃ Example: /ludo 4\n` +
        `┃ Example: /ludo 4 1000\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    if (betAmount !== null && (!Number.isFinite(betAmount) || betAmount <= 0)) {
      return message.reply("❌ Please enter a valid bet amount.");
    }

    const userData = await getUser(usersData, userID);
    const userMoney = Number(userData.money || 0);

    const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const rolledNumber = Math.floor(Math.random() * 6) + 1;
    const resultFace = diceFaces[rolledNumber - 1];

    let change = 0;
    let resultText = "";

    if (betAmount !== null) {
      if (userMoney < betAmount) {
        return message.reply(
          `❌ You don't have enough money.\n💰 Balance: ${formatNumber(userMoney)}`
        );
      }

      if (rolledNumber === choice) {
        change = betAmount * 2;
        resultText =
          `🏆 𝗬𝗢𝗨 𝗪𝗜𝗡!\n` +
          `🎉 You won ${formatNumber(change)}!`;
      } else {
        change = -betAmount;
        resultText =
          `💔 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧!\n` +
          `💸 ${formatNumber(betAmount)} was deducted.`;
      }
    } else {
      const winAmount = 1_000_000_000_000;
      const lossAmount = 500_000_000_000;

      if (rolledNumber === choice) {
        change = winAmount;
        resultText =
          `🏆 𝗝𝗔𝗖𝗞𝗣𝗢𝗧!\n` +
          `💰 You won ${formatNumber(winAmount)}!`;
      } else {
        change = -lossAmount;
        resultText =
          `💔 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧!\n` +
          `💸 ${formatNumber(lossAmount)} was deducted.`;
      }
    }

    const newBalance = userMoney + change;

    await setUser(usersData, userID, {
      money: newBalance.toString(),
      data: userData.data
    });

    return message.reply(
      `╭━━━〔 🎲 L U D O 〕━━━╮\n` +
      `┃\n` +
      `┃  🎯 Your Guess : ${choice}\n` +
      `┃  🎲 Dice       : ${resultFace} ${rolledNumber}\n` +
      `┃\n` +
      `┃  ──────────────────\n` +
      `┃\n` +
      `┃  ${resultText.replace(/\n/g, "\n┃  ")}\n` +
      `┃\n` +
      `┃  💰 Balance : ${formatNumber(newBalance)}\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━╯`
    );
  }
};

function formatNumber(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  let number = Number(num);

  while (number >= 1000 && unit < units.length - 1) {
    number /= 1000;
    unit++;
  }

  return `${number.toFixed(2)}${units[unit]}`;
}
