const fs = require("fs");
const path = require("path");

const trackerPath = path.join(__dirname, "forward-tracker.json");
if (!fs.existsSync(trackerPath)) fs.writeFileSync(trackerPath, JSON.stringify({}));

module.exports = {
  config: {
    name: "sendmsg",
    aliases: [],
    version: "1.0",
    author: "Tarek",
    countDown: 2,
    role: 2,
    shortDescription: {
      en: "Send message to any UID"
    },
    longDescription: {
      en: "Send message to a specific Facebook UID via bot"
    },
    category: "admin",
    guide: {
      en: ".sendmsg <uid> - <message>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input.includes("-")) {
      return api.sendMessage("❌ Format:\n.sendmsg <uid> - <message>", event.threadID, event.messageID);
    }

    const [uidPart, ...msgArr] = input.split("-");
    const uid = uidPart.trim();
    const message = msgArr.join("-").trim();

    if (!uid || !message) {
      return api.sendMessage("⚠️ Please provide both UID and message.", event.threadID, event.messageID);
    }

    try {
      const sent = await api.sendMessage(message, uid);
      const tracker = JSON.parse(fs.readFileSync(trackerPath));
      tracker[sent.messageID] = uid;
      fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));

      return api.sendMessage(`✅ Message sent to UID ${uid}`, event.threadID, event.messageID);
    } catch (err) {
      console.log("❌ Error sending message:", err.message);
      return api.sendMessage("❌ Couldn't send message. Is the UID correct?", event.threadID, event.messageID);
    }
  }
};
