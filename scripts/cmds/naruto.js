const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "naruto",
    version: "1.3",
    role: 0,
    author: "Eren",
    category: "anime",
    guide: {
      en: "{p}naruto -s[season] -ep[episode]\nExample: {p}naruto -s1 -ep1"
    }
  },

  onStart: async function({ api, event, args }) {
    try {
      // Fetch episode data from GitHub
      const response = await axios.get('https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/naruto_episodes.json');
      const narutoDatabase = response.data;
      
      // Parse command arguments
      let seasonNum, episodeNum;
      
      args.forEach(arg => {
        if (arg.startsWith('-s')) seasonNum = arg.substring(2);
        else if (arg.startsWith('-ep')) episodeNum = arg.substring(3);
      });

      if (!seasonNum || !episodeNum) {
        return api.sendMessage("❌ Usage: !naruto -s[season] -ep[episode]\nExample: !naruto -s1 -ep1", event.threadID);
      }

      const seasonKey = `season${seasonNum}`;
      const episodeKey = `episode${episodeNum}`;

      if (!narutoDatabase[seasonKey]?.[episodeKey]) {
        return api.sendMessage(`❌ Season ${seasonNum} Episode ${episodeNum} not available`, event.threadID);
      }

      const videoUrl = narutoDatabase[seasonKey][episodeKey];
      
      api.sendMessage(`⏳ Loading Naruto S${seasonNum}E${episodeNum}...`, event.threadID);

      // Temporary file path
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const videoPath = path.join(tempDir, `naruto_s${seasonNum}e${episodeNum}.mp4`);

      // Download video
      const writer = fs.createWriteStream(videoPath);
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      videoResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send video
      await api.sendMessage({
        body: `🎬 Naruto S${seasonNum}E${episodeNum}\nEnjoy! 🍥`,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID);

      // Clean up
      fs.unlinkSync(videoPath);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ Error: " + (error.response?.status === 404 ? 
        "Episode database not found" : 
        "Failed to load episode. Please try again later."), 
      event.threadID);
    }
  }
};
