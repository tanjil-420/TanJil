const cmd = {
  config: {
    usePrefix: true,
    name: "slot",
    aliases: ["bet"],
    version: "1.6.9",
    author: "Nazrul",
    category: "game",
    guide: {
  en: `{pn} <amount> — Spin the slot (min 500)
{pn} me/info [@mention/reply] — View slot stats
{pn} top — Top 15 users by win count
{pn} topmoney — Top 15 by total earned
{pn} lostmoney — Top 15 by money lost
{pn} rich — Top 15 richest users (balance)
{pn} list / all — Full slot leaderboard
{pn} history — Show your last 10 spins
{pn} clear [@mention/reply] — Clear slot history (admin for others)
{pn} claim — Claim your daily bonus
{pn} reset [uid/@mention/reply] — Admin only reset user data
{pn} help — Show this help menu`
},
    countDown: 5
  },

  onStart: async function ({ args, message, event, usersData, globalData }) {
    const { senderID: userID, mentions, messageReply } = event;
    const prefix = await global.utils.getPrefix(event.threadID);
    const now = Date.now();
    const { config } = global.GoatBot;

    const userData = await usersData.get(userID) || { money: 0, name: `User_${userID}` };
    const userName = userData.name || `User_${userID}`;

    let raw = await globalData.get("slotFullData");
    if (!raw) {
      await globalData.create("slotFullData", { data: {}, jackpotPool: 0 });
      raw = { data: {}, jackpotPool: 0 };
    }

    const slotData = raw.data || {};
    let jackpotPool = raw.jackpotPool || 0;

    if (args[0] === "reset") {

  const isAdmin = userID === config?.adminBot || config?.adminBot?.includes(userID);

  if (!isAdmin)
    return message.reply("❌ Only bot Admin can use reset!");

  const targetID = Object.keys(mentions)[0] || (messageReply && messageReply.senderID) || args[1];
  if (!targetID) return message.reply("• Mention, reply, or provide UID to reset.");

  if (!slotData[targetID])
    return message.reply("❌ No slot data found for that user.");

  slotData[targetID].todayLeft = 20;
  slotData[targetID].lastPlayed = Date.now();
  await globalData.set("slotFullData", { data: slotData, jackpotPool });

  return message.reply(`✅ Reset play limit for ${slotData[targetID].name || `UID: ${targetID}`}`);
}

    if (!slotData[userID]) slotData[userID] = createEmptyUserData(userName);
    else slotData[userID] = fixUserData(slotData[userID], userName);
    let data = slotData[userID];

    const resetInterval = 5 * 60 * 60 * 1000;
    if (!data.lastPlayed || now - data.lastPlayed >= resetInterval) {
      data.todayLeft = 20;
      data.lastPlayed = now;
    }

    if (args[0] === "claim") {
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - (data.claimedBonus || 0) < oneDay)
        return message.reply(`❌ Already claimed!\nCome back in: ${formatDuration(oneDay - (now - data.claimedBonus))}`);
      const reward = 2000;
      await usersData.set(userID, { money: (userData.money || 0) + reward });
      data.claimedBonus = now;
      slotData[userID] = data;
      await globalData.set("slotFullData", { data: slotData, jackpotPool });
      return message.reply(`✅ Claimed Daily Bonus: +${formatMoney(reward)}`);
    }

    if (["me", "info"].includes(args[0])) {
      const targetID = Object.keys(mentions)[0] || (messageReply && messageReply.senderID) || userID;
      if (!slotData[targetID]) return message.reply("❌ No data found for that user.");
      let tData = fixUserData(slotData[targetID], slotData[targetID].name || `User_${targetID}`);
      return message.reply(
        `🎀 Stats for ${tData.name}:\n` +
        `• Wins: ${tData.wins}\n• Losses: ${tData.losses}\n` +
        `• Total Win: ${formatMoney(tData.winAmount)}\n` +
        `• Total Lost: ${formatMoney(tData.lostAmount)}\n` +
        `• Win Streak: ${tData.streak}\n• Remaining: ${tData.todayLeft}/20\n` +
        `• Reset in: ${formatDuration(resetInterval - (now - tData.lastPlayed))}\n` +
        `• Jackpot Pool: ${formatMoney(jackpotPool)}`
      );
    }

    if (args[0] === "history") {
      const h = data.history?.slice(-10).map((r, i) => `${i + 1}. ${r}`) || [];
      return message.reply(`📜 Last ${h.length} Results:\n` + h.join("\n"));
    }

 if (args[0] === "clear") {

  const isAdmin = userID === config?.adminBot || config?.adminBot?.includes(userID);

  if (args[1] === "all") {
    if (!isAdmin)
      return message.reply("❌ Only Admins can clear all users' history.");

    for (const id in slotData) {
      slotData[id].history = [];
    }

    await globalData.set("slotFullData", { data: slotData, jackpotPool });
    return message.reply("🧹 Cleared history for all users.");
  }

  const targetID = Object.keys(mentions)[0] || (messageReply && messageReply.senderID) || userID;

  if (targetID !== userID && !isAdmin)
    return message.reply("❌ Only Admins can clear others' slot history.");

  if (!slotData[targetID])
    return message.reply("❌ No slot data found for that user.");

  slotData[targetID].history = [];
  await globalData.set("slotFullData", { data: slotData, jackpotPool });

  return message.reply(
    `🧹 Cleared slot history for ${targetID === userID ? "you" : slotData[targetID].name || `UID: ${targetID}`}`
  );
}

    const allUsers = Object.entries(slotData).map(([uid, d]) => fixUserData(d, d.name));

    if (args[0] === "top") {
      const top = allUsers.sort((a, b) => b.wins - a.wins).slice(0, 15);
      return message.reply(`🏆 Top 15 Slot Players:\n` + top.map((d, i) => `${i + 1}. ${d.name} — ${d.wins} wins`).join("\n"));
    }

    if (args[0] === "topmoney") {
      const top = allUsers.sort((a, b) => b.winAmount - a.winAmount).slice(0, 15);
      return message.reply(`💸 Top Earners in Slot:\n` + top.map((d, i) => `${i + 1}. ${d.name} — ${formatMoney(d.winAmount)}`).join("\n"));
    }

    if (args[0] === "lostmoney") {
      const top = allUsers.sort((a, b) => b.lostAmount - a.lostAmount).slice(0, 15);
      return message.reply(`💀 Most Lost Money:\n` + top.map((d, i) => `${i + 1}. ${d.name} — ${formatMoney(d.lostAmount)}`).join("\n"));
    }

    if (args[0] === "rich") {
      const richList = await usersData.getAll();
      const sorted = richList.sort((a, b) => (b.money || 0) - (a.money || 0)).slice(0, 15);
      return message.reply(`💰 Richest Users:\n` + sorted.map((u, i) => `${i + 1}. ${u.name} — ${formatMoney(u.money || 0)}`).join("\n"));
    }

    if (["list", "all"].includes(args[0])) {
      const full = allUsers.sort((a, b) => b.wins - a.wins);
      return message.reply(`📜 Full Slot Leaderboard:\n` + full.map((d, i) => `${i + 1}. ${d.name} — ${d.wins} wins`).join("\n"));
    }

    if (args[0] === "help") {
      return message.reply(
        `🎀 Slot Help:\n\n` +
        `• ${prefix}slot <amount>: Spin slot\n` +
        `• ${prefix}slot me/info: Check user stats\n` +
        `• ${prefix}slot top: Top by wins\n` +
        `• ${prefix}slot topmoney: Top by win money\n` +
        `• ${prefix}slot lostmoney: Top by lost money\n` +
        `• ${prefix}slot rich: Top by balance\n` +
        `• ${prefix}slot history: Last 10 spins\n` +
        `• ${prefix}slot claim: Claim daily bonus\n` +
        `• ${prefix}slot reset [uid/reply/mention]: Admin only`
      );
    }

    if (data.todayLeft <= 0)
      return message.reply(`❌ Play limit Reached !\nTry again in: ${formatDuration(resetInterval - (now - data.lastPlayed))}`);

    const bet = parseMoney(args[0]);
    if (!bet || bet < 500) return message.reply("• Minimum bet is 500!");
    if (bet > 100000000) return message.reply("• Maximum bet is 100M!");
    if (bet > (userData.money || 0)) return message.reply(`💸 Not enough money!\nBalance: ${formatMoney(userData.money || 0)}`);

    const symbols = [
      { emoji: "🦆", weight: 35, payout: [0, 0, 2, 5, 10] },
      { emoji: "🎀", weight: 30, payout: [0, 0, 3, 7, 15] },
      { emoji: "🍓", weight: 25, payout: [0, 0, 4, 10, 20] },
      { emoji: "❤️", weight: 15, payout: [0, 0, 5, 15, 30] },
      { emoji: "💜", weight: 10, payout: [0, 0, 7, 20, 50] },
      { emoji: "💙", weight: 5, payout: [0, 0, 10, 30, 100] },
      { emoji: "🤍", weight: 3, payout: [0, 0, 20, 50, 200] },
      { emoji: "💚", weight: 2, payout: [0, 0, 50, 150, 500] }
    ];

    const reels = Array(5).fill().map(() => {
      const pool = symbols.flatMap(s => Array(s.weight).fill(s.emoji));
      return pool[Math.floor(Math.random() * pool.length)];
    });

    const result = calculateResult(reels, symbols, bet);
    let newBalance = (userData.money || 0) + result.win;

    if (result.win < 0) {
      jackpotPool += Math.abs(result.win * 0.2);
      data.lostAmount += Math.abs(result.win);
    } else {
      if (result.type === "jackpot") {
        result.win += jackpotPool;
        newBalance += jackpotPool;
        jackpotPool = 0;
      }
      data.winAmount += result.win;
    }

    data.streak = result.win > 0 ? data.streak + 1 : 0;
    result.win > 0 ? data.wins++ : data.losses++;
    data.todayLeft--;
    data.history.push(`${result.type === "jackpot" ? "🎉 JACKPOT" : result.win > 0 ? "✅ WIN" : "❌ LOSE"} | ${reels.join(" ")} | ${formatMoney(result.win)} | New: ${formatMoney(newBalance)}`);
    if (data.history.length > 20) data.history.shift();

    slotData[userID] = data;
    await usersData.set(userID, { money: newBalance });
    await globalData.set("slotFullData", { data: slotData, jackpotPool });

    return message.reply({
      body: createResponse(userName, reels.join(" | "), result, bet, newBalance),
      mentions: [{ id: userID, tag: userName }]
    });
  }
};

function createEmptyUserData(name) {
  return {
    name,
    wins: 0,
    losses: 0,
    streak: 0,
    winAmount: 0,
    lostAmount: 0,
    todayLeft: 20,
    lastPlayed: 0,
    claimedBonus: 0,
    history: []
  };
}

function fixUserData(data, name) {
  return {
    name: data.name || name,
    wins: data.wins || 0,
    losses: data.losses || 0,
    streak: data.streak || 0,
    winAmount: data.winAmount || 0,
    lostAmount: data.lostAmount || 0,
    todayLeft: typeof data.todayLeft === "number" ? data.todayLeft : 20,
    lastPlayed: data.lastPlayed || 0,
    claimedBonus: data.claimedBonus || 0,
    history: data.history || []
  };
}

function calculateResult(reels, symbols, bet) {
  const counts = reels.reduce((a, e) => (a[e] = (a[e] || 0) + 1, a), {});
  let win = 0, combos = [], jackpot = false;

  Object.entries(counts).forEach(([sym, cnt]) => {
    const s = symbols.find(s => s.emoji === sym);
    const match = Math.min(cnt, 5);
    if (match >= 3 && s.payout[match - 1]) {
      const amount = bet * s.payout[match - 1];
      win += amount;
      combos.push(`${sym} x${cnt} (${s.payout[match - 1]}x)`);
      if (match >= 5) jackpot = true;
    }
  });

  const pairs = Object.values(counts).filter(c => c === 2).length;
  if (pairs >= 2 && win === 0) {
    win = bet * 1.5;
    combos.push("Two Pairs (1.5x)");
  }

  return {
    win: win || -bet,
    type: jackpot ? "jackpot" : win >= bet * 10 ? "big" : win > 0 ? "normal" : "loss",
    combos
  };
}

function createResponse(name, reels, { win, type, combos }, bet, newBalance) {
  const absWin = Math.abs(win);
  const formattedWin = formatMoney(absWin);
  const formattedNewBalance = formatMoney(newBalance);

  if (win > 0) {
    const base = {
      jackpot: `🎀 JACKPOT!\n\n👑 ${name} WON ${formattedWin}!\n\n• ${reels}\n\n• ${combos.join("\n")}\n\n🏆 JACKPOT!`,
      big: `🎀 BIG WIN!\n\n👑 ${name} won ${formattedWin}!\n\n• ${reels}\n\n• ${combos.join("\n")}`,
      normal: `👑 ${name} won ${formattedWin}!\n\n• ${reels}\n\n• ${combos.join(", ")}`
    };
    return `${base[type]}\n\n• New Balance: ${formattedNewBalance}`;
  }

  return `🦎 Better luck next time!\n• ${name}\n• Lost: ${formattedWin}\n• ${reels}\n• Available Balance: ${formattedNewBalance}`;
}

function parseMoney(input) {
  if (!input) return NaN;
  const match = input.match(/^([\d.,]+)\s*([a-zA-Z]*)$/);
  if (!match) return NaN;
  const num = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2]?.toLowerCase();
  const multipliers = {
    k: 1e3, m: 1e6, b: 1e9, t: 1e12, qa: 1e15, qi: 1e18,
    sx: 1e21, sp: 1e24, oc: 1e27, no: 1e30, dc: 1e33,
    ud: 1e36, dd: 1e39, td: 1e42, qad: 1e45, qid: 1e48,
    sxd: 1e51, spd: 1e54, od: 1e57, nd: 1e60, vg: 1e63
  };
  return num * (multipliers[suffix] || 1);
}

function formatMoney(amount) {
  if (amount < 1000) return `$${amount.toFixed(2)}`;
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const exp = Math.floor(Math.log10(amount) / 3);
  const shortVal = (amount / Math.pow(1000, exp)).toFixed(2);
  return `$${shortVal}${suffixes[exp] || ''}`;
}

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

module.exports = cmd;
