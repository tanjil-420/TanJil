const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "s",
    aliases: ["songname", "search"],
    version: "2.0",
    author: "Mahi",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Identify song from audio or video"
    },
    longDescription: {
      en: "Reply to a video or audio to detect the song name and details"
    },
    category: "image",
    guide: {
      en: "Reply to an audio or video and use -whatsong"
    }
  },

  onStart: async function ({ message, event }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0)
      return message.reply("🎵 | Please reply to a video or audio file.");

    const attachment = event.messageReply.attachments[0];
    const url = attachment.url;
    const ext = attachment.type === "audio" ? "mp3" : "mp4";
    const filePath = __dirname + `/cache/whatsong.${ext}`;

    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, res.data);

      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));

      const result = await axios.post("https://mahi-songxfinder-v3.onrender.com/api/whatsong", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(filePath);

      const data = result.data;
      if (!data.success) return message.reply("❌ | Sorry, couldn't detect the song.");

      const reply = `🎧 Song Detected:
• Title: ${data.title}
• Artist: ${data.artist}
• Album: ${data.album || "N/A"}
• Released: ${data.release || "Unknown"}
• Link: ${data.link || "N/A"}
`;

      message.reply(reply);

    } catch (err) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.error(err);
      message.reply("⚠️ | An error occurred while detecting the song.");
    }
  }
};
