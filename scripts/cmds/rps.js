const {
  getUser,
  setUser
} = require("../utils/dataStore");

module.exports = {
  config: {
    name: "rockpaperscissor",
    aliases: ["rps"],
    version: "1.0",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play Rock Paper Scissors with style!",
    },
    longDescription: {
      en: "Challenge the bot in an exciting Rock Paper Scissors game and win virtual money!",
    },
    category: "games",
    guide: {
      en: "{pn} [rock/paper/scissors]",
    }
  },

  onStart: async function ({ event, message, args, users }) {
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = {
      rock: "✊",
      paper: "✋",
      scissors: "✌️"
    };

    const userChoice = args[0]?.toLowerCase();

    if (!userChoice || !choices.includes(userChoice)) {
      return message.reply(
        `╭━━━〔 🎮 R P S 〕━━━╮\n` +
        `┃\n` +
        `┃  ⚠️ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗖𝗵𝗼𝗶𝗰𝗲\n` +
        `┃\n` +
        `┃  Choose one of the following:\n` +
        `┃\n` +
        `┃  ✊  Rock\n` +
        `┃  ✋  Paper\n` +
        `┃  ✌️  Scissors\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const userData = await getUser(users, event.senderID);
    const currentMoney = Number(userData.money || 0);

    let resultMessage = "";
    let newBalance = currentMoney;

    if (userChoice === botChoice) {
      resultMessage =
        `🤝 𝗜𝘁'𝘀 𝗮 𝗗𝗿𝗮𝘄!\n` +
        `Both chose ${emojis[userChoice]} ${userChoice}.`;
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'scissors' && botChoice === 'paper') ||
      (userChoice === 'paper' && botChoice === 'rock')
    ) {
      newBalance = currentMoney + 500;

      await setUser(users, event.senderID, {
        money: newBalance.toString(),
        data: userData.data,
      });

      resultMessage =
        `🏆 𝗬𝗼𝘂 𝗪𝗶𝗻!\n` +
        `🎉 You earned 500৳`;
    } else {
      if (currentMoney >= 500) {
        newBalance = currentMoney - 500;

        await setUser(users, event.senderID, {
          money: newBalance.toString(),
          data: userData.data,
        });

        resultMessage =
          `😈 𝗜 𝗪𝗶𝗻!\n` +
          `💸 You lost 500৳`;
      } else {
        resultMessage =
          `😈 𝗜 𝗪𝗶𝗻!\n` +
          `💸 You had insufficient balance, so nothing was deducted.`;
      }
    }

    return message.reply(
      `╭━━━〔 🎮 R O C K • P A P E R • S C I S S O R S 〕━━━╮\n` +
      `┃\n` +
      `┃  👤 𝗬𝗼𝘂      ${emojis[userChoice]} ${userChoice}\n` +
      `┃  🤖 𝗕𝗼𝘁      ${emojis[botChoice]} ${botChoice}\n` +
      `┃\n` +
      `┃  ─────────────────────\n` +
      `┃\n` +
      `┃  ${resultMessage.replace(/\n/g, "\n┃  ")}\n` +
      `┃\n` +
      `┃  💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲   $${formatNumber(newBalance)}\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
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
