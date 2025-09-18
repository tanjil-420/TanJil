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
• Custom bet: Win double if correct, lose the bet if wrong.
• Default mode: Win 1 Trillion if correct, lose 500 Billion if wrong.

➤ Notes:
• Only valid numbers (1 to 6) are accepted.
• Make sure you have enough balance if placing a bet.
      `
    }
  },

  onStart: async function ({ event, args, message, usersData }) {
    const userID = event.senderID;
    const choice = args[0];
    const betAmount = args[1] ? parseInt(args[1]) : null;

    if (!choice || isNaN(choice) || choice < 1 || choice > 6) {
      return message.reply("Please choose a number between 1 to 6.\nUsage: /ludo 4 or /ludo 4 1000");
    }

    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const rolled = Math.floor(Math.random() * 6);
    const resultFace = diceFaces[rolled];
    const rolledNumber = rolled + 1;

    const userData = await usersData.get(userID);
    let userMoney = userData.money || 0;

    if (betAmount) {
      if (betAmount > userMoney) {
        return message.reply(`You don't have enough money! Your current balance: ${userMoney}`);
      }

      if (rolledNumber == choice) {
        const winAmount = betAmount * 2;
        await usersData.set(userID, { money: userMoney + winAmount });
        return message.reply(`🎲 Dice: ${resultFace} (${rolledNumber})\n✅ You won! You earned ${winAmount} coins!`);
      } else {
        await usersData.set(userID, { money: userMoney - betAmount });
        return message.reply(`🎲 Dice: ${resultFace} (${rolledNumber})\n❌ You lost! ${betAmount} coins have been deducted.`);
      }

    } else {
      const winAmount = 1_000_000_000_000;
      const lossAmount = 500_000_000_000;

      if (rolledNumber == choice) {
        await usersData.set(userID, { money: userMoney + winAmount });
        return message.reply(`🎲 Dice: ${resultFace} (${rolledNumber})\n🏆 You won 1 Trillion coins!`);
      } else {
        await usersData.set(userID, { money: userMoney - lossAmount });
        return message.reply(`🎲 Dice: ${resultFace} (${rolledNumber})\n😢 You lost! 500 Billion coins have been deducted.`);
      }
    }
  }
};
