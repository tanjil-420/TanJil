const { getDiamond, setDiamond } = require("../utils/dataStore");

module.exports = {
  config: {
    name: "doubleguess",
    aliases: ["dg", "diamondgame", "dgame"],
    version: "2.0.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "game",
    shortDescription: {
      en: "Guess the meaning and win diamonds"
    },
    longDescription: {
      en: "Guess emoji combinations correctly to win diamonds"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const threadID = String(event.threadID);

    const questions = [
      { q: "☀️ + 😎", a: ["summer", "sunny day", "sunny"] },
      { q: "🌧️ + ☕", a: ["rainy day", "rainy mood", "rain and coffee"] },
      { q: "❤️ + 🩹", a: ["healing heart", "broken heart healing", "healing"] },
      { q: "🌙 + ⭐", a: ["good night", "night sky", "night"] },
      { q: "🍎 + 👨‍⚕️", a: ["stay healthy", "health", "healthy"] },
      { q: "📚 + ☕", a: ["study time", "studying", "study"] },
      { q: "🎂 + 🎉", a: ["birthday", "happy birthday"] },
      { q: "🌹 + ❤️", a: ["love", "romantic love", "romance"] },
      { q: "🏠 + ❤️", a: ["home sweet home", "my home", "home"] },
      { q: "✈️ + 🌍", a: ["travel", "travelling", "world travel"] },
      { q: "🎵 + 🎧", a: ["music", "listening to music", "music time"] },
      { q: "🍕 + 😋", a: ["delicious food", "yummy", "hungry"] },
      { q: "😴 + 🛏️", a: ["sleep", "sleeping", "bedtime"] },
      { q: "🏃 + 💪", a: ["exercise", "workout", "fitness"] },
      { q: "💰 + 🐷", a: ["save money", "savings", "money saving"] },
      { q: "📱 + 🔋", a: ["charge phone", "charging", "phone charging"] },
      { q: "🔑 + 🚪", a: ["open the door", "unlock", "key"] },
      { q: "☕ + 🌅", a: ["morning coffee", "good morning", "morning"] },
      { q: "🌧️ + ☂️", a: ["rain", "rainy weather", "umbrella"] },
      { q: "🔥 + 🧯", a: ["fire safety", "put out fire", "fire"] },
      { q: "🐶 + ❤️", a: ["love dogs", "dog lover", "dog love"] },
      { q: "🐱 + 🏠", a: ["cat at home", "pet cat", "cat"] },
      { q: "👀 + ❤️", a: ["love at first sight", "i love you", "love"] },
      { q: "🤝 + ❤️", a: ["friendship", "good friends", "friends"] },
      { q: "👫 + ❤️", a: ["couple", "love couple", "relationship"] },
      { q: "💔 + 😢", a: ["heartbroken", "sad love", "broken heart"] },
      { q: "😊 + 🌸", a: ["happy", "happiness", "happy life"] },
      { q: "😡 + 🔥", a: ["angry", "very angry", "anger"] },
      { q: "😂 + 🤣", a: ["funny", "laughing", "laughter"] },
      { q: "😭 + 💔", a: ["crying", "heartbroken", "very sad"] },
      { q: "🤫 + 🤐", a: ["keep secret", "secret", "silence"] },
      { q: "🎁 + 🎂", a: ["birthday gift", "gift", "present"] },
      { q: "📞 + ❤️", a: ["call me", "phone call", "call"] },
      { q: "💌 + ❤️", a: ["love letter", "letter", "love message"] },
      { q: "🌍 + 🏠", a: ["world home", "our world", "home"] },
      { q: "☀️ + 🌻", a: ["sunflower", "sunny", "summer"] },
      { q: "🌊 + 🏖️", a: ["beach", "sea beach", "vacation"] },
      { q: "⏰ + 🛏️", a: ["wake up", "alarm", "wake up time"] },
      { q: "🍔 + 🍟", a: ["fast food", "food", "burger and fries"] },
      { q: "🚗 + 🛣️", a: ["road trip", "drive", "driving"] },
      { q: "🎮 + 🏆", a: ["gaming", "game winner", "win the game"] },
      { q: "⚽ + 🥅", a: ["football", "soccer", "football game"] },
      { q: "🏏 + 🏆", a: ["cricket", "cricket winner", "cricket match"] },
      { q: "🎤 + 🎶", a: ["singing", "singer", "music"] },
      { q: "📷 + 📸", a: ["take a photo", "photography", "photo"] },
      { q: "💻 + 🌐", a: ["internet", "online", "web"] },
      { q: "🔒 + 🔑", a: ["lock and key", "locked", "security"] },
      { q: "🧠 + 💡", a: ["smart idea", "good idea", "idea"] },
      { q: "👂 + 🎵", a: ["listen to music", "hearing music", "music"] },
      { q: "👃 + 🌹", a: ["smell the rose", "nice smell", "fragrance"] },
      { q: "👁️ + 🔍", a: ["look closely", "search", "find"] },
      { q: "🗣️ + 👂", a: ["talk and listen", "conversation", "communication"] },
      { q: "❤️ + 🏠", a: ["love home", "home love", "family"] },
      { q: "👨‍👩‍👧‍👦 + ❤️", a: ["family love", "family", "happy family"] },
      { q: "🌳 + 🍃", a: ["nature", "green nature", "tree"] },
      { q: "🌱 + 💧", a: ["grow", "plant growth", "water the plant"] },
      { q: "🐝 + 🌸", a: ["bee and flower", "pollination", "flower"] },
      { q: "🐟 + 🌊", a: ["fish in water", "sea life", "fish"] },
      { q: "🦋 + 🌸", a: ["butterfly", "beautiful nature", "flower"] },
      { q: "❄️ + ⛄", a: ["winter", "snow", "snowman"] },
      { q: "🌈 + ☀️", a: ["rainbow", "after rain", "beautiful weather"] },
      { q: "🌙 + 💤", a: ["sleep at night", "good night", "sleep"] },
      { q: "☕ + 📖", a: ["reading", "read a book", "book and coffee"] },
      { q: "✏️ + 📖", a: ["study", "writing", "school"] },
      { q: "🎓 + 📚", a: ["education", "student", "graduation"] },
      { q: "🏫 + 📚", a: ["school", "school life", "student"] },
      { q: "💼 + 💰", a: ["job", "work", "salary"] },
      { q: "🏦 + 💰", a: ["bank", "bank money", "saving money"] },
      { q: "💳 + 🛒", a: ["shopping", "buying", "online shopping"] },
      { q: "📦 + 🚚", a: ["delivery", "package delivery", "parcel"] },
      { q: "📍 + 🗺️", a: ["location", "map", "find location"] },
      { q: "🚦 + 🚗", a: ["traffic", "traffic light", "driving"] },
      { q: "🚑 + 🏥", a: ["hospital", "emergency", "ambulance"] },
      { q: "👨‍🍳 + 🍳", a: ["cooking", "chef", "cook"] },
      { q: "🍳 + 🥚", a: ["breakfast", "cooking eggs", "egg"] },
      { q: "🍵 + 🌿", a: ["green tea", "tea", "healthy tea"] },
      { q: "🍫 + ❤️", a: ["chocolate love", "sweet love", "chocolate"] },
      { q: "🍦 + ☀️", a: ["ice cream", "summer", "cold dessert"] },
      { q: "🍉 + ☀️", a: ["summer fruit", "watermelon", "summer"] },
      { q: "🎄 + 🎁", a: ["christmas", "christmas gift", "christmas presents"] },
      { q: "🎃 + 👻", a: ["halloween", "scary", "halloween night"] },
      { q: "🎆 + 🎉", a: ["new year", "celebration", "fireworks"] },
      { q: "💍 + ❤️", a: ["marriage", "wedding", "engagement"] },
      { q: "💐 + 💍", a: ["wedding", "proposal", "marriage"] },
      { q: "👰 + 🤵", a: ["wedding", "married couple", "marriage"] },
      { q: "❤️ + 🔐", a: ["locked heart", "loyal love", "my heart is yours"] },
      { q: "👋 + 🚪", a: ["goodbye", "leaving", "bye"] },
      { q: "🙏 + ❤️", a: ["thank you", "grateful", "thanks"] },
      { q: "🎉 + 🥳", a: ["celebration", "party", "happy"] },
      { q: "😎 + 🔥", a: ["cool", "looking cool", "awesome"] },
      { q: "💪 + 🔥", a: ["strong", "powerful", "strength"] },
      { q: "🧘 + 🌿", a: ["peace", "relax", "meditation"] },
      { q: "😴 + ☕", a: ["sleepy", "need coffee", "coffee needed"] },
      { q: "📱 + ❤️", a: ["phone love", "love my phone", "mobile"] },
      { q: "💻 + 🎮", a: ["pc gaming", "computer gaming", "gaming"] },
      { q: "🎧 + 🎮", a: ["gaming music", "game with headphones", "gaming"] },
      { q: "🚀 + 🌙", a: ["space travel", "moon trip", "space"] },
      { q: "🌌 + ⭐", a: ["night sky", "stars", "galaxy"] },
      { q: "🔭 + ⭐", a: ["stargazing", "astronomy", "looking at stars"] },
      { q: "🧳 + ✈️", a: ["travel", "trip", "vacation"] },
      { q: "🏝️ + ☀️", a: ["vacation", "island", "holiday"] },
      { q: "🏕️ + 🔥", a: ["camping", "campfire", "camping trip"] },
      { q: "🏖️ + 🌊", a: ["beach", "sea", "holiday"] },
      { q: "🗓️ + ⏰", a: ["schedule", "time", "appointment"] },
      { q: "⏳ + ❤️", a: ["wait for love", "waiting", "love takes time"] },
      { q: "📅 + ❤️", a: ["special day", "date", "important date"] },
      { q: "1️⃣ + ❤️", a: ["number one", "you are number one", "first love"] },
      { q: "2️⃣ + ❤️", a: ["couple", "two hearts", "love couple"] },
      { q: "❤️ + ❤️", a: ["love", "two hearts", "true love"] },
      { q: "💯 + ❤️", a: ["true love", "100 percent love", "perfect love"] },
      { q: "⭐ + 🏆", a: ["winner", "champion", "best"] },
      { q: "🔥 + 🏆", a: ["champion", "winning", "best player"] },
      { q: "🎯 + 🏆", a: ["goal achieved", "success", "winner"] },
      { q: "💡 + 🎯", a: ["good idea", "goal", "idea"] },
      { q: "🚪 + 🔑", a: ["open door", "unlock", "opportunity"] },
      { q: "🌱 + ☀️", a: ["growth", "new life", "new beginning"] },
      { q: "🌅 + 🌱", a: ["new beginning", "new day", "fresh start"] },
      { q: "🕊️ + ❤️", a: ["peace", "peaceful love", "freedom"] }
    ];

    global.doubleGuessGames ??= {};

    // একই group-এ আগের game থাকলে সেটা বন্ধ করা
    const oldGame = global.doubleGuessGames[threadID];

    if (oldGame) {
      clearTimeout(oldGame.timeout);

      try {
        await message.unsend(oldGame.messageID);
      } catch {}

      delete global.doubleGuessGames[threadID];
    }

    const pick = questions[Math.floor(Math.random() * questions.length)];

    const sent = await message.reply(
      `╭━━━〔 🧠 DOUBLE GUESS 〕━━━╮\n` +
      `┃\n` +
      `┃ ❓ Guess the meaning:\n` +
      `┃\n` +
      `┃       ${pick.q}\n` +
      `┃\n` +
      `┃ ⏳ You have 30 seconds!\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    );

    global.doubleGuessGames[threadID] = {
      answers: pick.a.map(answer => answer.toLowerCase().trim()),
      messageID: sent.messageID,
      timeout: setTimeout(async () => {
        const game = global.doubleGuessGames[threadID];

        if (!game) return;

        try {
          await message.reply(
            `╭━━━〔 ⏰ TIME'S UP 〕━━━╮\n` +
            `┃\n` +
            `┃ ❌ You lost!\n` +
            `┃\n` +
            `┃ ✅ Answer: ${pick.a[0]}\n` +
            `┃\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━╯`
          );
        } catch {}

        try {
          await message.unsend(game.messageID);
        } catch {}

        delete global.doubleGuessGames[threadID];
      }, 30000)
    };
  },

  onChat: async function ({ event, message }) {
    const threadID = String(event.threadID);
    const senderID = String(event.senderID);

    const game = global.doubleGuessGames?.[threadID];

    if (!game) return;

    const userAnswer = String(event.body || "")
      .toLowerCase()
      .trim();

    if (!userAnswer) return;

    if (!game.answers.includes(userAnswer)) return;

    clearTimeout(game.timeout);

    delete global.doubleGuessGames[threadID];

    try {
      await message.unsend(game.messageID);
    } catch {}

    const reward = 50;

    try {
      const currentDiamonds = await getDiamond(senderID);
      const newDiamonds = currentDiamonds + reward;

      await setDiamond(senderID, newDiamonds);

      await message.reply(
        `╭━━━〔 🎉 CORRECT! 〕━━━╮\n` +
        `┃\n` +
        `┃ 🎯 Great job!\n` +
        `┃\n` +
        `┃ 💎 Reward: +${reward} Diamonds\n` +
        `┃ 💰 Total: ${formatNumber(newDiamonds)}💎\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    } catch (error) {
      console.error("❌ DoubleGuess diamond reward error:", error);

      await message.reply(
        "❌ Your answer was correct, but the diamond reward could not be saved."
      );
    }
  }
};

function formatNumber(num) {
  const units = [
    "", "K", "M", "B", "T",
    "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"
  ];

  let number = Number(num) || 0;
  let unit = 0;

  while (number >= 1000 && unit < units.length - 1) {
    number /= 1000;
    unit++;
  }

  return `${number.toFixed(2)}${units[unit]}`;
}
