const axios = require("axios");
const fs = require("fs-extra");

const songList = [
  "https://drive.google.com/file/d/1Ho2brPqRpc8kg-UYpBFYxFdDQn3wTkgU/view?usp=drivesdk",
  "https://drive.google.com/file/d/1HpvewYOGo1yy5beQ_RTYiPVnTxLSxD5g/view?usp=drivesdk",
  "https://drive.google.com/file/d/1HpwRE2XT1GOMht72SWZt2gyeVvsDAmVj/view?usp=drivesdk",
  "https://drive.google.com/file/d/1HwAnDvrxRfbg2iN5HQDA6lNC772rSbG_/view?usp=drivesdk",
  "https://drive.google.com/file/d/1HwbqqzdOfE2E9BkPDeqjgLJn5ANrAQv4/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IDE0NXE5Hx-ubxCVbdDYYRYdhvg4kSNp/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IHSK0Jf_ooKkTuonvhcqFzQGW7ehegWo/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IQA6pO-TFAtJ6m6qhf4JgKuINIdMMq1u/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IQXEzRiisReOtCGSsPwZ4FwlSUG1Az9m/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IRDk5lLeGJlDkzlyfQV3NXMA3eAwxwr2/view?usp=drivesdk",
  "https://drive.google.com/file/d/1ITv4fJBCjE6h2i_KVb8IxSXQGbjF0zOH/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IW46rpTTUc_Ya6qHiRTtRTZAS-wUQxpB/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IZsHk3L8Z4af7pm101G7V4WRdXH2yxNO/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IdKMPlexEDO_eBT0aYVzeEoioPElH2qq/view?usp=drivesdk",
  "https://drive.google.com/file/d/1IdQtP52PCwh1ZoWzsCUw1TqjlIodZC-Z/view?usp=drivesdk",
  "https://drive.google.com/file/d/1Ig-xK83MZZE3auekWA8b-1fITgSeB42Z/view?usp=drivesdk",
];

module.exports = {
  config: {
    name: "gan",
    version: "1.3",
    author: "Tarek",
    countDown: 3,
    role: 0,
    shortDescription: "Send random song or show how many available",
    longDescription: "Randomly sends a song/video or shows how many songs exist",
    category: "media",
    guide: {
      en: "{pn} — get a random song\n{pn} list — show how many songs"
    }
  },

  onStart: async function ({ message, args }) {
    if (args[0] === "list") {
      return message.reply(`🎵 Total songs: ${songList.length} available!`);
    }

    const randomIndex = Math.floor(Math.random() * songList.length);
    const currentSong = songList[randomIndex];
    const fileId = currentSong.match(/\/d\/(.*?)\//)?.[1];

    if (!fileId) return message.reply("❌ Invalid Google Drive link format.");

    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const filePath = __dirname + "/cache/gan_random.mp4";

    try {
      const response = await axios({
        method: "GET",
        url: directUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: "🎶 Here's your random song! Enjoy 💖",
          attachment: fs.createReadStream(filePath)
        });
      });

      writer.on("error", () => {
        message.reply("❌ Couldn't save the song locally.");
      });

    } catch (error) {
      console.error(error.message);
      message.reply("⚠️ Something went wrong while downloading the song.");
    }
  }
};
