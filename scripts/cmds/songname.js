const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "songname",
    aliases: ["songname", "song"],
    version: "1.0",
    author: "Tarek",
    countDown: 5,
    role: 0,
    shortDescription: "Detect song name from audio/video",
    usage: "{pn} (reply to a song or video)",
  },

  formatSongInfo(title, artist, album, releaseDate, link) {
    return (
`╭─「 🎶 𝙎𝙤𝙣𝙜 𝘿𝙚𝙩𝙖𝙞𝙡𝙨 」─╮
│ 🎵 Title   : ${title}
│ 🎤 Artist  : ${artist}
│ 💿 Album   : ${album}
│ 📅 Released: ${releaseDate}
│ 🔗 Link    : ${link}
╰────────────────╯`
    );
  },

  async onStart({ event, api }) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    // Guide message as per your request
    const guideMessage = `Guide ${event.prefix || "{pn}"} (reply to a song or video)`;

    try {
      // Check if user replied to a message
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage(guideMessage, threadID, messageID);
      }

      const attachment = event.messageReply.attachments[0];

      // Check if attachment is audio or video
      if (!["audio", "video"].includes(attachment.type)) {
        return api.sendMessage(guideMessage, threadID, messageID);
      }

      // Download attachment as buffer
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      const audioBuffer = response.data;

      // Prepare form data for Audd.io
      const formData = new FormData();
      formData.append("file", Buffer.from(audioBuffer), "audiofile");

      // Your Audd.io API token (inserted here)
      const apiToken = "30a1b184522528e0bc72e397b9cae9ed";

      const res = await axios({
        method: "post",
        url: `https://api.audd.io/`,
        data: formData,
        headers: formData.getHeaders(),
        params: {
          api_token: apiToken,
          return: "apple_music,spotify",
        },
      });

      if (!res.data || !res.data.result) {
        return api.sendMessage("😔 Sorry, no song detected. Try a clearer audio!", threadID, messageID);
      }

      const result = res.data.result;

      const title = result.title || "Unknown";
      const artist = result.artist || "Unknown";
      const album = result.album || "Unknown";
      const releaseDate = result.release_date || "Unknown";
      const songLink = result.song_link || result.spotify?.external_urls?.spotify || result.apple_music?.url || "No Link";

      const replyMsg = this.formatSongInfo(title, artist, album, releaseDate, songLink);

      return api.sendMessage(replyMsg, threadID, messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred while detecting the song. Try again later.", threadID, messageID);
    }
  },
};
