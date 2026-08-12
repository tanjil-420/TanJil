const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "tiksearch",
  aliases: ["tiksr"],
  version: "1.6.9",
  role: 0,
  author: "♡ 𝐍𝐚𝐳𝐫𝐮𝐥 ♡",
  category: "tiktok Video",
  description: "Get TikTok Video From list",
  countDowns: 2,
  guide: {
    en: "{p}{n} username"
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  const username = args[0];

  if (!username) {
    return api.sendMessage("🔰 Please provide a TikTok username.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(`${await baseApiUrl()}/nazrul/tikSearch?query=${encodeURIComponent(username)}`);
    const videoData = response.data.data.videos;

    if (!videoData || videoData.length === 0) {
      return api.sendMessage("No videos found for this username.", event.threadID, event.messageID);
    }

    const listMessage = videoData.map((video, index) => {
      const title = video.title || "No title";
      const author = video.author ? video.author.nickname : "Unknown author";
      const likes = video.digg_count || "N/A";
      const played = video.play_count || "N/A";
      const duration = video.duration || "N/A";
      const created = new Date(video.create_time * 1000).toLocaleString();
      const musicTitle = video.music_info ? video.music_info.title : "No music title";
      const musicAuthor = video.music_info && video.music_info.author ? video.music_info.author : "Unknown music author";
      const musicUrl = video.music_info ? video.music_info.play : "No music URL";

      return `${index + 1}. 🎥 Title: ${title}\n👤 Author: ${author}\n👍 Likes: ${likes}\n💙 Played: ${played}\n🎶 Video Duration: ${duration}s\n📅 Created: ${created}\n\n`
          + `🎵 Music Title: ${musicTitle}\n👤 Author: ${musicAuthor}\n🎶 Music link : ${musicUrl}`;
    }).join("\n\n");

    api.sendMessage(`Select an option by replying with the number:\n\n${listMessage}`, event.threadID, (error, info) => {
      if (error) return console.error(error);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: "selectVideo",
        messageID: info.messageID,
        author: event.senderID,
        videoData: videoData
      });
    }, event.messageID);

  } catch (error) {
    api.sendMessage("Error: " + error.message, event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  const { type, videoData, author, selectedIndex } = Reply;

  if (event.senderID !== author) return;

  if (type === "selectVideo") {
    const selectedIndex = parseInt(event.body.trim()) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= videoData.length) {
      return api.sendMessage("Invalid selection. Please reply with a valid number.", event.threadID, event.messageID);
    }

    const selectedVideo = videoData[selectedIndex];
    const selectionInfo = `You selected:\n🎥 Title: ${selectedVideo.title || "No title"}\n👤 Author: ${selectedVideo.author.nickname || "Unknown"}\n\nReply with:\n1 - Get Video\n2 - Get Music`;

    api.sendMessage(selectionInfo, event.threadID, (error, info) => {
      if (error) return console.error(error);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: "selectOption",
        messageID: info.messageID,
        author: event.senderID,
        videoData: videoData,
        selectedIndex: selectedIndex
      });
    }, event.messageID);

  } else if (type === "selectOption") {
    const selectedIndex = Reply.selectedIndex;
    const selectedVideo = videoData[selectedIndex];
    const videoInfo = `🎥 Title: ${selectedVideo.title || "No title"}\n👤 Author: ${selectedVideo.author.nickname || "Unknown"} (${selectedVideo.author.unique_id || "Unknown ID"})\n👍 Likes: ${selectedVideo.digg_count || "N/A"}\n💙 Played: ${selectedVideo.play_count || "N/A"}\n🎶 Video Duration: ${selectedVideo.duration || "N/A"}s\n📅 Created: ${new Date(selectedVideo.create_time * 1000).toLocaleString()}`;
    const musicInfo = `🎶 Music Title: ${selectedVideo.music_info ? selectedVideo.music_info.title : "No title"}\n👤 Author: ${selectedVideo.music_info && selectedVideo.music_info.author ? selectedVideo.music_info.author.nickname : "Unknown"} (${selectedVideo.music_info && selectedVideo.music_info.author ? selectedVideo.music_info.author.unique_id : "Unknown ID"})\n📅 Created: ${new Date(selectedVideo.create_time * 1000).toLocaleString()}`;

    api.unsendMessage(Reply.messageID);

    switch (event.body.trim()) {
      case '1':
        try {
          const videoStream = (await axios.get(selectedVideo.play, { responseType: 'stream' })).data;
          api.sendMessage({ body: videoInfo, attachment: videoStream }, event.threadID, event.messageID);
        } catch (error) {
          api.sendMessage(videoInfo, event.threadID, event.messageID);
        }
        break;

      case '2':
        try {
          const musicStream = (await axios.get(selectedVideo.music, { responseType: 'stream' })).data;
          api.sendMessage({ body: musicInfo, attachment: musicStream }, event.threadID, event.messageID);
        } catch (error) {
          api.sendMessage(musicInfo, event.threadID, event.messageID);
        }
        break;

      default:
        api.sendMessage("Invalid selection. Please reply with '1' for video or '2' for music.", event.threadID, event.messageID);
        break;
    }
  }
};
