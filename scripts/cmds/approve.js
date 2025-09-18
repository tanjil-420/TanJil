const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "approve",
    aliases: ["approveall", "aa"],
    version: "2.0",
    author: "Eren",
    role: 2,
    category: "group",
    shortDescription: "Approve pending members in Messenger group",
    longDescription: "Show pending list, approve single or all members in Messenger group",
    guide: {
      en: "{p}approve → Show pending list\nReply with number to approve single\nReply 'all' to approve everyone"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadID = event.threadID;
      const botID = api.getCurrentUserID();
      const threadInfo = await api.getThreadInfo(threadID);

      const isAdmin = threadInfo.adminIDs.some(adm => adm.id == botID);
      if (!isAdmin) return api.sendMessage("❌ I need to be an admin to approve members.", threadID);

      const pending = threadInfo.approvalQueue || [];
      if (!pending.length) return api.sendMessage("✅ No pending requests found.", threadID);

      // Fetch names
      let msg = "👥 Pending Approval List:\n\n";
      const userInfos = {};
      for (let i = 0; i < pending.length; i++) {
        let name = "Unknown User";
        try {
          const info = await api.getUserInfo(pending[i].requesterID);
          name = info[pending[i].requesterID]?.name || `User${i + 1}`;
        } catch {}
        userInfos[pending[i].requesterID] = name;
        msg += `${i + 1}. ${name} (${pending[i].requesterID})\n`;
      }
      msg += "\n➡ Reply with number to approve.\n➡ Reply 'all' to approve everyone.";

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "approve",
          author: event.senderID,
          pending,
          userInfos,
          messageID: info.messageID
        });

        // Auto remove session after 5 mins
        setTimeout(() => {
          if (global.GoatBot.onReply.has(info.messageID)) {
            global.GoatBot.onReply.delete(info.messageID);
            api.sendMessage("⌛ Approval session timed out.", threadID);
          }
        }, 300000);
      });

    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠️ Failed to fetch pending list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID != Reply.author) return;

    const body = event.body.trim().toLowerCase();
    const threadID = event.threadID;

    const approveMember = async (userID) => {
      try {
        await api.addUserToGroup(userID, threadID);
        return true;
      } catch (err) {
        console.error("Add user error:", err);
        return false;
      }
    };

    // Approve all
    if (body === "all") {
      let success = 0, failed = 0;
      for (const user of Reply.pending) {
        const result = await approveMember(user.requesterID);
        if (result) success++; else failed++;
        await new Promise(res => setTimeout(res, 500));
      }
      global.GoatBot.onReply.delete(Reply.messageID);
      const time = moment().tz("Asia/Dhaka").format("hh:mm A, DD/MM/YYYY");
      return api.sendMessage(`✅ Approved: ${success}\n❌ Failed: ${failed}\n🕒 ${time}`, threadID);
    }

    // Approve single
    const number = parseInt(body);
    if (isNaN(number) || number < 1 || number > Reply.pending.length) {
      return api.sendMessage("❌ Invalid number. Reply with correct number or 'all'.", threadID);
    }

    const user = Reply.pending[number - 1];
    const name = Reply.userInfos[user.requesterID] || `User${number}`;
    const result = await approveMember(user.requesterID);
    global.GoatBot.onReply.delete(Reply.messageID);

    const time = moment().tz("Asia/Dhaka").format("hh:mm A, DD/MM/YYYY");
    if (result) return api.sendMessage(`✅ Approved: ${name}\n🕒 ${time}`, threadID);
    else return api.sendMessage(`❌ Failed to approve: ${name}\n🕒 ${time}`, threadID);
  }
};
