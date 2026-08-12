const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "premium",
    aliases: ["pm"],
    version: "1.6.9",
    author: "Nazrul",
    countDown: 5,
    role: 2,
    description: "Manage user premium (add/remove/view/extend/list)",
    category: "system",
    usePrefix: true,
    isPremium: false,
    guide: {
      en: "{pn} add <user> <days>\n{pn} remove <user>\n{pn} view <user>\n{pn} extend <user> <days>\n{pn} list"
    }
  },

  onLoad: async function ({ usersData }) {
    const checkInterval = 30 * 60 * 1000;

    setInterval(async () => {
      const allUsers = await usersData.getAll();
      const now = Date.now();
      let expiredCount = 0;

      for (const user of allUsers) {
        if (user.premium?.isPremium === true && user.premium?.expiresAt) {
          if (now > user.premium.expiresAt) {
            await usersData.set(user.userID, {
              ...user,
              premium: {
                isPremium: false,
                expiresAt: null,
                expiredAt: now
              }
            });
            expiredCount++;
            console.log(`[Premium Auto-Expire] ❌ Premium expired for ${user.name || user.userID}`);
          }
        }
      }

      if (expiredCount > 0) {
        console.log(`[Premium] Total ${expiredCount} users' premium expired`);
      }
    }, checkInterval);


  },

  onStart: async function ({ message, args, role, event, usersData }) {
    if (role < 2) return message.reply("• Only bot admin can use this command.");

    const subCmd = (args[0] || "").toLowerCase();
    const mentions = [];

    const getTargetUID = () => {
      if (Object.keys(event.mentions || {}).length > 0)
        return Object.keys(event.mentions)[0];
      if (event.type === "message_reply")
        return event.messageReply.senderID;
      if (!isNaN(args[1])) return args[1];
      return null;
    };

    const getDays = () => {
      const parsed = args.find(arg => !isNaN(arg));
      return parsed ? parseInt(parsed) : null;
    };

    const toEndOfDay = (startDate, days) => {
      return moment(startDate)
        .tz("Asia/Dhaka")
        .add(days, "days")
        .endOf("day") 
        .valueOf();
    };

    const targetUID = getTargetUID();

    if (subCmd === "list" || subCmd === "l") {
      const allUsers = await usersData.getAll();
      const now = Date.now();
      let expiredCount = 0;

      for (const u of allUsers) {
        if (u.premium?.isPremium === true && u.premium?.expiresAt) {
          if (now > u.premium.expiresAt) {
            u.premium = {
              isPremium: false,
              expiresAt: null,
              expiredAt: now
            };
            await usersData.set(u.userID, u);
            expiredCount++;
          }
        }
      }

      const premiumUsers = allUsers.filter(u => {
        return u.premium?.isPremium === true && u.premium?.expiresAt > now;
      });

      if (premiumUsers.length === 0)
        return message.reply("• No users currently have premium.");

      let listMsg = `👑 Premium Users (${premiumUsers.length}):\n`;
      if (expiredCount > 0) {
        listMsg += `⚠️ (${expiredCount} expired and removed)\n\n`;
      } else {
        listMsg += "\n";
      }

      for (const u of premiumUsers) {
        const timeLeft = u.premium.expiresAt - now;
        const expiryDate = moment(u.premium.expiresAt).tz("Asia/Dhaka").format("DD/MM HH:mm");
        listMsg += `• ${u.name || "Unknown"} (${u.userID})\n  ⏳ ${msToTime(timeLeft)} left\n  📅 Expires: ${expiryDate}\n\n`;
      }
      return message.reply(listMsg);
    }

    if (!targetUID || isNaN(targetUID))
      return message.reply("• Please mention, reply to, or provide a valid UID of a user.");

    const userData = await usersData.get(targetUID);
    if (!userData) return message.reply("• User not found.");

    mentions.push({ id: targetUID, tag: userData.name || "User" });

    const now = Date.now();
    if (userData.premium?.isPremium === true && userData.premium?.expiresAt) {
      if (now > userData.premium.expiresAt) {
        userData.premium = {
          isPremium: false,
          expiresAt: null,
          expiredAt: now
        };
        await usersData.set(targetUID, userData);
      }
    }

    if (subCmd === "stats" || subCmd === "info" || subCmd === "view" || subCmd === "v") {
      const isPremium = userData.premium?.isPremium === true && userData.premium?.expiresAt > now;
      const expireTime = userData.premium?.expiresAt || null;
      let msg = `👤 ${userData.name || "Unknown"}\n• UID: ${targetUID}\n• Premium: ${isPremium ? "✅ Yes" : "❌ No"}`;

      if (isPremium && expireTime) {
        const remaining = expireTime - now;
        msg += `\n• Expires in: ${msToTime(remaining)}\n• Expiry Date: ${moment(expireTime).tz("Asia/Dhaka").format("DD-MM-YYYY HH:mm:ss")}`;
      } else if (!isPremium && userData.premium?.expiredAt) {
        msg += `\n• Expired on: ${moment(userData.premium.expiredAt).tz("Asia/Dhaka").format("DD-MM-YYYY HH:mm:ss")}`;
      }
      return message.reply({ body: msg, mentions });
    }

    if (subCmd === "add" || subCmd === "a") {
      const days = getDays();
      if (!days || isNaN(days) || days <= 0)
        return message.reply("• Provide a valid number of days.");

      const expiresAt = toEndOfDay(Date.now(), days);
      userData.premium = { 
        isPremium: true, 
        expiresAt,
        addedAt: Date.now()
      };
      await usersData.set(targetUID, userData);

      const expiryDate = moment(expiresAt).tz("Asia/Dhaka").format("DD-MM-YYYY HH:mm:ss");
      return message.reply({ 
        body: `✅ Premium added to ${userData.name || "user"}\n• Duration: ${days} days\n• Expires: ${expiryDate}\n• Time: ${msToTime(expiresAt - Date.now())}`, 
        mentions 
      });
    }

    if (subCmd === "remove" || subCmd === "r") {
      userData.premium = { 
        isPremium: false,
        removedAt: Date.now()
      };
      await usersData.set(targetUID, userData);
      return message.reply({ body: `✅ Premium removed from ${userData.name || "user"}.`, mentions });
    }

    if (subCmd === "extend" || subCmd === "ed") {
      const extraDays = getDays();
      if (!extraDays || isNaN(extraDays) || extraDays <= 0)
        return message.reply("• Provide a valid number of days to extend.");

      const currentExpiry = (userData.premium?.isPremium === true && userData.premium?.expiresAt > Date.now()) 
        ? userData.premium.expiresAt 
        : Date.now();

      const newExpiry = toEndOfDay(currentExpiry, extraDays);
      userData.premium = { 
        isPremium: true, 
        expiresAt: newExpiry,
        extendedAt: Date.now()
      };
      await usersData.set(targetUID, userData);

      const expiryDate = moment(newExpiry).tz("Asia/Dhaka").format("DD-MM-YYYY HH:mm:ss");
      return message.reply({
        body: `✅ Premium extended for ${userData.name || "user"}\n• Added: ${extraDays} days\n• New Expiry: ${expiryDate}\n• Total Time: ${msToTime(newExpiry - Date.now())}`,
        mentions
      });
    }

    return message.reply("• Invalid Use!");
  }
};

function msToTime(duration) {
  if (duration <= 0) return "Expired";
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}