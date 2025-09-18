module.exports = {
  config: {
    name: "listbox",
    version: "1.0",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 0,
    shortDescription: "Show current groups where bot is a member",
    longDescription: "Lists only those groups where the bot is currently present",
    category: "utility",
    guide: {
      en: "{p}listbox"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = allThreads.filter(thread => thread.name != null && thread.isGroup);

      const activeGroups = [];

      for (const thread of groupThreads) {
        try {
          const info = await api.getThreadInfo(thread.threadID);
          if (info.participantIDs.includes(api.getCurrentUserID())) {
            activeGroups.push({
              name: info.threadName || "Unnamed Group",
              threadID: info.threadID
            });
          }
        } catch (e) {
          // Skip any inaccessible group
        }
      }

      if (activeGroups.length === 0) {
        return api.sendMessage("❌ The robot is not currently in any group ⚠️", event.threadID);
      }

      let message = "🎀      Group List      🎀\n\n";
      activeGroups.forEach((group, index) => {
        message += `${index + 1}. ${group.name}\n🆔 ${group.threadID}\n\n`;
      });

      api.sendMessage(message.trim(), event.threadID);
    } catch (err) {
      console.error("listbox error:", err);
      api.sendMessage("❌ Sorry ", event.threadID);
    }
  }
};
