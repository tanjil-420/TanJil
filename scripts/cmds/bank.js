module.exports = {
  config: {
    name: "bank",
    version: "3.0",
    description: "Deposit, withdraw, earn interest, loan system, bet, service, details",
    guide: {
      vi: "",
      en: `💫 Bank Commands 💫

💖 bank - Show bank features
💙 bank balance - Show your balance
💛 bank deposit [amount] - Deposit money
💜 bank withdraw [amount] - Withdraw money
✨ bank interest - Earn double after 6h
🌷 bank loan - Take a 20k loan
😇 bank repay [amount] - Repay your loan
😍 bank top - Top 10 richest users
🖤 bank bet [amount] - Bet with bank balance
🧾 bank service - Show all bank services (বাংলায়)
📊 bank details - Show your banking details`
    },
    category: "game",
    countDown: 1,
    role: 0,
    author: "〲T A N J I L ツ"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { MongoClient } = require("mongodb");
    const uri = "mongodb+srv://tanjil4:tanjil4@cluster0.lqh9lyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("bankSystem");
      const users = db.collection("users");
      const uid = event.senderID;
      const action = args[0]?.toLowerCase();
      const amount = parseInt(args[1]);

      const prefix = "〲٭⃝🎀 ⃝𝐘𝐎𝐔𝐑 𝐁𝐀𝐁𝐘 ⃝🎀\n\n";

      const user = await users.findOneAndUpdate(
        { uid },
        {
          $setOnInsert: {
            balance: 0,
            loan: 0,
            lastInterest: Date.now(),
            interestCount: 0,
            interestProfit: 0,
            joinedAt: Date.now()
          }
        },
        { upsert: true, returnDocument: "after" }
      );

      const userData = user?.value;

      switch (action) {
        case "balance":
          return message.reply(`${prefix}💙 Your bank balance: ${userData.balance} $✨`);

        case "deposit": {
          if (!amount || amount <= 0)
            return message.reply(`${prefix}🌷 Example: bank deposit 100`);

          const currentMoney = await usersData.get(uid, "money") || 0;
          if (currentMoney < amount)
            return message.reply(`${prefix}❌ You don't have enough cash to deposit.`);

          await usersData.set(uid, "money", currentMoney - amount);
          await users.updateOne({ uid }, { $inc: { balance: amount } });

          return message.reply(`${prefix}💖 Deposited ${amount} $ successfully from your cash! 🏦`);
        }

        case "withdraw": {
  if (!amount || amount <= 0) {
    return message.reply("${prefix}💖 Please enter a valid amount to withdraw. 🤗");
  }

  const userData = user.value;

  if (amount > userData.balance) {
    return message.reply("${prefix}🪽 Not enough balance in your bank! 😢");
  }

  // 
  await users.updateOne({ uid }, { $inc: { balance: -amount } });

  // usersData 
  const currentMoney = await usersData.get(uid, "money") || 0;

  // 
  await usersData.set(uid, { money: currentMoney + amount });

  return message.reply(`${prefix}✅ You withdrew $${amount} successfully! 🎀`);
}

        case "interest": {
          const cooldown = 6 * 60 * 60 * 1000;
          const now = Date.now();
          const elapsed = now - userData.lastInterest;

          if (elapsed < cooldown) {
            const remaining = cooldown - elapsed;
            const h = Math.floor(remaining / 3600000);
            const m = Math.floor((remaining % 3600000) / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            return message.reply(`${prefix}🕒 Please wait ${h}h ${m}m ${s}s to claim interest again.`);
          }

          const earned = userData.balance * 2;
          await users.updateOne(
            { uid },
            {
              $inc: { balance: earned, interestCount: 1, interestProfit: earned },
              $set: { lastInterest: now }
            }
          );

          return message.reply(`${prefix}💸 You've earned $${earned} interest!`);
        }

        case "loan": {
          if (userData.loan > 0)
            return message.reply(`${prefix}👀 You already have a loan. Repay first.`);

          await users.updateOne({ uid }, { $inc: { balance: 20000, loan: 20000 } });
          return message.reply(`${prefix}😍 You received a loan of 20,000 $💸\n💫 Please repay within 3 days.`);
        }

        case "repay": {
          if (!amount || amount <= 0)
            return message.reply(`${prefix}💛 Example: bank repay 1000`);
          if (userData.loan <= 0)
            return message.reply(`${prefix}💙 You don’t have any active loans.`);
          if (userData.balance < amount)
            return message.reply(`${prefix}💫 Not enough balance to repay.`);

          const repayAmount = Math.min(amount, userData.loan);
          const remainingLoan = userData.loan - repayAmount;
          await users.updateOne(
            { uid },
            { $inc: { loan: -repayAmount, balance: -repayAmount } }
          );

          return message.reply(`${prefix}💖 Repaid ${repayAmount} $. Remaining loan: ${remainingLoan} $`);
        }

        case "bet": {
  if (!amount || isNaN(amount) || amount <= 0) {
    return message.reply(`${prefix}❌ Invalid amount.\n📌 Example: /bank bet 100`);
  }

  if (userData.balance < amount) {
    return message.reply(`${prefix}💸 You don't have enough balance to place this bet.`);
  }

  // 60% chance to lose
  const didWin = Math.random() < 0.4; // 40% chance to win

  // Weighted multipliers: more chance for 1.0–2.0 range
  const weightedMultipliers = [
    1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3,
    1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
    2.5, 3.0, 3.5, 4.0, 5.0 // Rare big wins
  ];
  const multiplier = weightedMultipliers[Math.floor(Math.random() * weightedMultipliers.length)];

  if (didWin) {
    const winAmount = Math.floor(amount * multiplier);
    await users.updateOne({ uid }, { $inc: { balance: winAmount } });
    return message.reply(
      `${prefix}🎉 You won the bet!\n💰 Bet: ${amount} $\n💸 Won: ${winAmount} $ (x${multiplier})`
    );
  } else {
    await users.updateOne({ uid }, { $inc: { balance: -amount } });
    return message.reply(
      `${prefix}😓 You lost the bet.\n💰 Bet: ${amount} $\n💸 Lost: ${amount} $`
    );
  }
}

        case "service":
          return message.reply(`${prefix}🔰 ব্যাংকের সকল সার্ভিস 🔰\n\n🏦 balance → ব্যাংকে জমাকৃত টাকা দেখতে পারবেন।\n💵 deposit [amount] → আপনার কাছে থাকা টাকা ব্যাংকে জমা দিতে পারবেন।\n🏧 withdraw [amount] → ব্যাংক থেকে টাকা তুলতে পারবেন (প্রতি ১০০০ টাকায় ৫০ টাকা চার্জ কাটা হয়)।\n⏳ interest → প্রতি ৬ ঘণ্টা পর আপনি আপনার ব্যালেন্স এর দ্বিগুণ সুদ পেতে পারেন।\n🏦 loan → একবারে ২০,০০০ টাকা লোন নিতে পারবেন।\n🔁 repay [amount] → আপনার লোন পরিশোধ করতে পারবেন।\n👑 top → ব্যাংকের শীর্ষ ১০ জন ব্যবহারকারীর তালিকা দেখবেন।\n🎀 topreset → সব ব্যবহারকারীর balance reset করা হয় (শুধুমাত্র owner ব্যবহার করতে পারবে)।\n🖤 bet [amount] → ব্যালেন্স থেকে টাকা বেট করতে পারবেন, জিতলে multiplier অনুযায়ী টাকা পাবেন।\n💻 details → আপনার ব্যাংক সংক্রান্ত বিস্তারিত তথ্য দেখাবে।`);

        case "details": {
  const uid = event.senderID;

  const userInfo = await usersData.get(uid);
  if (!userInfo) {
    return message.reply("❌ User data not found. Please register first!");
  }

  const name = userInfo.name || "Unknown";
  const balance = userInfo.balance ?? 0; // 🛠️ এখানে balance ঠিক করা হয়েছে
  const betWon = userInfo.betWon ?? 0;
  const betLost = userInfo.betLost ?? 0;
  const joinDate = userInfo.joinedAt ? new Date(userInfo.joinedAt) : new Date();
  const now = new Date();
  const usedDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));

  const bdTime = now.toLocaleString("en-US", { 
    timeZone: "Asia/Dhaka", 
    hour12: true 
  });

  const response = 
`📊 𝗕𝗔𝗡𝗞 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 📊

👤 Name: ${name}
🧾 UID: ${uid}
💵 Balance: ${balance} $

🏆 Total Wins in Bank Game: ${betWon}
💥 Total Losses in Bank Game: ${betLost}

🗓️ Days Active in Bank System: ${usedDays} day(s)

📅 Current Date & Time (BD): ${bdTime}
`;

  return message.reply(response);
}

        case "topreset": {
          const adminUID = "61579222525905";
          if (event.senderID !== adminUID)
            return message.reply(`${prefix}❌ You are not authorized to use this command.`);

          const targetUID = args[1];
          if (targetUID) {
            const result = await users.updateOne({ uid: targetUID }, { $set: { balance: 0 } });
            if (result.matchedCount === 0)
              return message.reply(`${prefix}❌ No user found with UID: ${targetUID}`);
            return message.reply(`${prefix}✅ User with UID ${targetUID}'s balance has been reset to 0.`);
          } else {
            const result = await users.updateMany({ balance: { $gt: 0 } }, { $set: { balance: 0 } });
            return message.reply(`${prefix}✅ All users' bank balances have been reset to 0.\nAffected users: ${result.modifiedCount}`);
          }
        }

        case "top": {
          const topUsers = await users.find({ balance: { $gt: 0 } }).sort({ balance: -1 }).limit(10).toArray();

          if (topUsers.length === 0)
            return message.reply(`${prefix}😶 No top users found.`);

          const formatNumber = num => num.toLocaleString();

          let topMsg = `${prefix}👑 TOP 10 BANK USERS 👑\n\n`;

          for (let i = 0; i < topUsers.length; i++) {
            const u = topUsers[i];
            try {
              const userInfo = await api.getUserInfo(u.uid);
              const name = userInfo[u.uid]?.name || "Unknown";
              topMsg += `${i + 1}. ${name} (UID: ${u.uid})\n💵 Balance: ${formatNumber(u.balance)} $\n\n`;
            } catch {
              topMsg += `${i + 1}. Unknown (UID: ${u.uid})\n💵 Balance: ${formatNumber(u.balance)} $\n\n`;
            }
          }

          return message.reply(topMsg.trim());
        }

        default:
          return message.reply(`〲٭⃝🎀 ⃝𝐘𝐎𝐔𝐑 𝐁𝐀𝐁𝐘 𝐋𝐢𝐬𝐭 ⃝🎀٭⃝\n━━━━━━━━━━━━━━━━━━\n\n1.🏦 balance\n2.💵 deposit [amount]\n3.🏧 withdraw [amount]\n4.⏳ interest [2x]\n5.🏦 loan [only 20000]\n6.🔁 repay [amount]\n7.👑 top [10 richest user]\n8.🎀 topreset  [ only owner ]\n9.🖤 Bank bet [ 1k / 1000 ]\n10.🏦 Bank service\n11.💻 Details`);
      }
    } finally {
      await client.close();
    }
  }
};
