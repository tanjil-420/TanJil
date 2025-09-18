module.exports = {
  config: {
    name: "slot",
    version: "2.0",
    author: "T A N J I L 🎀",
    shortDescription: {
      en: "Stylish slot machine game",
    },
    longDescription: {
      en: "Slot machine game with emoji rarity and beautiful design.",
    },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to play.",
      not_enough_money: "Not enough balance to place this bet.",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const name = userData.name || `ID: ${senderID}`;
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slot1 = getRandomEmoji();
    const slot2 = getRandomEmoji();
    const slot3 = getRandomEmoji();
    const resultArray = [slot1, slot2, slot3];
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);
    const newBalance = userData.money + winnings;

    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data,
    });

    let status = "";
    if (slot1 === slot2 && slot2 === slot3) {
      status = `🎉 JACKPOT! You won $${winnings}!`;
    } else if (winnings > 0) {
      status = `✅ You won $${winnings}!`;
    } else {
      status = `❌ You lost $${amount}.`;
    }

    const response = formatResult({
      name,
      amount,
      result: resultArray,
      status,
      balance: newBalance,
    });

    return message.reply(response);
  },
};

// Emoji rarity system (more ❤️, less 🖤)
const emojiChances = {
  "❤️": 25,
  "🧡": 20,
  "💛": 15,
  "💚": 10,
  "💙": 8,
  "💜": 5,
  "🖤": 2,
};

function getRandomEmoji() {
  const pool = [];
  for (const [emoji, chance] of Object.entries(emojiChances)) {
    for (let i = 0; i < chance; i++) {
      pool.push(emoji);
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function calculateWinnings(s1, s2, s3, amount) {
  if (s1 === "💚" && s2 === "💚" && s3 === "💚") return amount * 10;
  if (s1 === "💛" && s2 === "💛" && s3 === "💛") return amount * 5;
  if (s1 === s2 && s2 === s3) return amount * 3;
  if (s1 === s2 || s1 === s3 || s2 === s3) return amount * 2;
  return -amount;
}

function formatResult({ name, amount, result, status, balance }) {
  return (
    `🎰 SLOT MACHINE 🎰\n` +
    `╔═════════════════╗\n` +
    `👤 Name      : ${name}\n` +
    `💰 Bet       : $${amount}\n` +
    `🎲 Result    : ${result.join(" | ")}\n` +
    `🏆 Status    : ${status}\n` +
    `💳 Balance   : $${balance}\n` +
    `╚═════════════════╝`
  );
}
