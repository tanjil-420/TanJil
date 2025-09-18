module.exports = {
  config: {
    name: "rps",
    version: "1.0",
    author: "〲T A N J I L ツ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play Rock Paper Scissors with style!",
    },
    longDescription: {
      en: "Challenge the bot in an exciting Rock Paper Scissors game and win virtual money!",
    },
    category: "game",
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
        `〈⩵⩵⩵⩵⩵⭐⬆⬇⭐⩵⩵⩵⩵⩵〉\n\n` +
        `❗ Please choose one: rock ✊, paper ✋, or scissors ✌️.\n\n` +
        `〈⩵⩵⩵⩵⩵⭐⬆⬇⭐⩵⩵⩵⩵⩵〉`
      );
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const userData = await users.get(event.senderID); // ইউজারের ব্যালেন্স আনবে

    let resultMessage = "";
    if (userChoice === botChoice) {
      resultMessage = `🤝 It's a draw! We both chose ${emojis[userChoice]} (${userChoice}).`;
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'scissors' && botChoice === 'paper') ||
      (userChoice === 'paper' && botChoice === 'rock')
    ) {
      // ইউজার জিতেছে
      await users.set(event.senderID, {
        money: userData.money + 500
      });
      resultMessage = `🏆 You win! You chose ${emojis[userChoice]} (${userChoice}) and I chose ${emojis[botChoice]} (${botChoice}).\n\n🎉 You earned 500৳!`;
    } else {
      // ইউজার হারেছে
      if (userData.money >= 500) {
        await users.set(event.senderID, {
          money: userData.money - 500
        });
        resultMessage = `😈 I win! You chose ${emojis[userChoice]} (${userChoice}) and I chose ${emojis[botChoice]} (${botChoice}).\n\n💸 You lost 500৳!`;
      } else {
        resultMessage = `😈 I win! You chose ${emojis[userChoice]} (${userChoice}) and I chose ${emojis[botChoice]} (${botChoice}).\n\n💸 You lost! (But you had no money to deduct!)`;
      }
    }

    return message.reply(
      `〈⩵⩵⩵⩵⩵⭐⬆⬇⭐⩵⩵⩵⩵⩵〉\n\n` +
      `${resultMessage}\n\n` +
      `〈⩵⩵⩵⩵⩵⭐⬆⬇⭐⩵⩵⩵⩵⩵〉`
    );
  }
};
