const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  name: "imgur",
  aliases: ["img", "im"],
  version: "1.0.0",
  author: "Nazrul",
  role: 0,
  category: "utility",
  usePrefix: true,
  requiredMoney: 500,
  description: "Upload attachment or URL to Imgur",
  countdown: 5,
  guide: { en: "Reply to an attachment or provide URLs" }
};

module.exports.onStart = async ({ event, message, args }) => {
  try {
    const replyUrl = event.messageReply?.attachments?.[0]?.url;
    const urls = [...(replyUrl ? [replyUrl] : []), ...args];
    if (!urls.length) return message.reply("❌ Reply to an attachment or provide URLs!");

    message.reaction("⏳", event.messageID, event.threadID);

    const results = [];
    for (const url of urls) {
      const { data: file } = await axios.get(url, { responseType: "arraybuffer" });
      const form = new FormData();
      form.append("image", file, "upload.jpg");
      form.append("type", "file");

      const { data } = await axios.post("https://api.imgur.com/3/upload", form, {
        headers: {
          ...form.getHeaders(),
          Authorization: "Client-ID d70305e7c3ac5c6"
        }
      });

      if (data?.success && data?.data?.link) {
        results.push(data.data.link);
      } else {
        results.push("❌ Failed to upload one file.");
      }
    }

    message.reaction("✅", event.messageID, event.threadID);
    message.reply(results.join("\n"));
  } catch (err) {
    console.error(err);
    message.reaction("❌", event.messageID, event.threadID);
    message.reply("❌ Upload failed. Try again later.");
  }
};