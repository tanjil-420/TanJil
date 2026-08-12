const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "alldl",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "media",
    guide: {
      en: "{pn} [video link] or reply to a link"
    }
  },

  onStart: async function ({ api, args, event }) {
    const link = args[0] || event.messageReply?.body;

    if (!link || !link.startsWith("http")) {
      return api.sendMessage(
        "❌ | Please provide a valid video link or reply to one.",
        event.threadID,
        event.messageID
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `alldl_${Date.now()}.mp4`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const base = await baseApiUrl();
      const apiUrl = `${base}/api/download/video?link=${encodeURIComponent(link)}`;
      const response = await axios({
        method: 'get',
        url: apiUrl,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      const stats = fs.statSync(filePath);
      if (stats.size < 100) {
        throw new Error("Invalid video file received.");
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return api.sendMessage(
        {
          body: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❎", event.messageID, () => {}, true);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return api.sendMessage(
        `🥹error, bby `,
        event.threadID,
        event.messageID
      );
    }
  }
};
