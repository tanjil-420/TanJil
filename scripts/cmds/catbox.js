const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  name: "catbox",
  aliases: ["cat","cb"],
  version: "1.6.9",
  author: "Nazrul",
  role: 0,
  category: "utility",
  usePrefix: true,
  requiredMoney: 500,
  description: "Upload attachment to Catbox",
  countdown: 5,
  guide: { en: "Reply to attachment or provide URL" }
};

module.exports.onStart = async ({ event, message, args }) => {
  try {
    const replyUrl = event.messageReply?.attachments?.[0]?.url;
    const urls = [...(replyUrl ? [replyUrl] : []), ...args];
    if (!urls.length) return message.reply("❌ Reply to an attachment or provide URLs!");

    const detectType = (url, filename) => {
      const ext = (filename || url.split("/").pop()).split(".").pop().toLowerCase();
      if (["jpg","jpeg","png","gif","webp","bmp"].includes(ext)) return "Image";
      if (["mp4","mov","mkv","webm"].includes(ext)) return "Video";
      if (["mp3","wav","ogg","m4a"].includes(ext)) return "Audio";
      return "File";
    };
    message.reaction("⏳", event.messageID,event.threadID); 
    const results = [];
    for (const url of urls) {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("userhash", "");
      const filename = url.split("/").pop().split("?")[0] || "file";
      form.append("fileToUpload", data, { filename });
      const res = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
      results.push(`${res.data}`);
    }
    message.reaction("✅", event.messageID,event.threadID); 
    message.reply(results.join("\n"));
  } catch {
    message.reply("❌ Failed to upload.");
    message.reaction("❌", event.messageID,event.threadID);
  }
};
