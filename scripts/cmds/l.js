const axios = require('axios');

module.exports = {
  config: {
    name: "l",
    aliases: [],
    version: "1.4",
    author: "Mahi@yan",
    role: 0,
    shortDescription: "Upload file to XYN API",
    longDescription: "Upload media file (via URL or reply) to XYN API and return uploaded file link",
    category: "utility",
    guide: "{pn} <file_url> or reply to a media message"
  },

  onStart: async function ({ api, event, args, usersData }) {
    let fileUrl = args[0];
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    if (!fileUrl && event.messageReply && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      const allowedTypes = ["photo", "audio", "video", "animated_image"];
      if (allowedTypes.includes(attachment.type)) {
        fileUrl = attachment.url;
      } else {
        return api.sendMessage("⚠️ Unsupported attachment type. Please reply to a photo, video, gif, or audio.", event.threadID, event.messageID);
      }
    }

    if (!fileUrl) {
      return api.sendMessage("❌ Please provide a URL or reply to a media file.", event.threadID, event.messageID);
    }

    const apiUrl = `https://xyn-mahi.up.railway.app/upload?url=${encodeURIComponent(fileUrl)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (data && data.file) {
        const message = 
`✅ ${data.status || "Upload successful"} \n
👤 Uploaded by: ${senderName}\n 
📁 File URL:
${data.file}`;

        return api.sendMessage(message, event.threadID, event.messageID);
      } else {
        return api.sendMessage("⚠️ Upload failed. Invalid response from server.", event.threadID, event.messageID);
      }
    } catch (error) {
      return api.sendMessage(`❌ Error occurred:\n${error.message}`, event.threadID, event.messageID);
    }
  }
};
