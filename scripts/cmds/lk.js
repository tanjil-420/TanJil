const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "lk",
    category: "MEDIA",
    author: "MaHi",
    description: "Upload media and get URL using dynamic base API",
    usage: "Reply to an image, video or audio file with: lk",
    cooldown: 5,
    role: 0
  },

  onStart: async ({ event, message, client }) => {
    const att = event.messageReply?.attachments?.[0];
    if (!att) return message.reply("Reply to an Image, Video or Audio file");

    try {
      const { data: apiConfig } = await axios.get("https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json");
      const baseUrl = apiConfig.lk;

      if (!baseUrl) return message.reply("Base API URL not found in config.");

      const response = await axios({
        method: "get",
        url: att.url,
        responseType: "stream"
      });

      const ext = path.extname(att.url.split("?")[0]) || ".jpg";
      const tempFile = `/tmp/upload${ext}`;
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const form = new FormData();
      form.append("file", fs.createReadStream(tempFile));

      const { data } = await axios.post(`${baseUrl}/upload`, form, {
        headers: form.getHeaders()
      });

      if (data.url) {
        const fullUrl = `${data.url}`;
        message.reply(`Uploaded ✅\nUrl: ${fullUrl}`);
      } else {
        message.reply("Upload failed: No URL returned");
      }

      fs.unlinkSync(tempFile);
    } catch (e) {
      message.reply("Error: " + e.message);
    }
  }
};
