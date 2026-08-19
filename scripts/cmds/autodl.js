const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function detectPlatform(url) {
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "Facebook";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("x.com") || url.includes("twitter.com")) return "Twitter / X";
  if (url.includes("pin.it") || url.includes("pinterest.com")) return "Pinterest";
  return "Unknown";
}

function extractVideo(data) {
  if (!data) return null;
  const r = data.result || {};
  return (
    r.high_quality || r.video || r.url || data.high_quality || data.video || data.url || null
  );
}

const SUPPORTED = [
  "https://vt.tiktok.com", "https://www.tiktok.com/", "https://vm.tiktok.com",
  "https://www.facebook.com/watch/", "https://www.facebook.com/reel/",
  "https://www.facebook.com/share/v", "https://www.facebook.com/share/r",
  "https://www.instagram.com/reel/", "https://youtu.be/", "https://youtube.com/",
  "https://x.com/", "https://twitter.com/", "https://pin.it/", "https://www.pinterest.com/"
];

module.exports = {
  config: {
    name: "autodl",
    version: "7.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "media",
    description: { en: "Advanced multi-platform video downloader" },
    guide: { en: "[video link]" }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const text = event.body ? event.body.trim() : "";
    if (!text.startsWith("http")) return;
    if (!SUPPORTED.some(link => text.startsWith(link))) return;

    api.setMessageReaction("📥", event.messageID, () => {}, true);
    const startTime = Date.now();

    try {
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `dl_${Date.now()}.mp4`);

      const res = await axios.get(
        `https://personal-autodl-api.onrender.com/downloader/alldl?url=${encodeURIComponent(text)}`,
        { timeout: 30000 }
      );

      const downloadUrl = extractVideo(res.data);
      if (!downloadUrl) {
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
        return;
      }

      const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        timeout: 45000
      });

      await fs.writeFile(filePath, Buffer.from(response.data));

      const info = res.data.result || res.data;
      const platform = detectPlatform(text);
      const latency = ((Date.now() - startTime) / 1000).toFixed(2);

      const message = {
        body: `⚡ Auto-Downloader\n\nTitle: ${info.title || "Untitled"}\nPlatform: ${platform}\nAuthor: ${info.author || "N/A"}\nLatency: ${latency}s\n\n- Dev by TanJil.4x`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, (err) => {
        if (err) console.error("Upload Error:", err);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, event.messageID);

    } catch (err) {
      console.error("AutoDL Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
