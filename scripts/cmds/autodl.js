const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/* =========================================================
 *                    AUTO DL CONFIG
 * ========================================================= */

const CONFIG = {
  API_URL: "https://personal-autodl-api.onrender.com/alldl",

  CACHE_DIR: path.join(__dirname, "cache"),

  TIMEOUT: {
    API: 45000,
    VIDEO: 60000
  },

  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/110.0.0.0 Safari/537.36",

  REACTIONS: {
    LOADING: "⏳",
    DOWNLOADING: "📥",
    PROCESSING: "⚡",
    SUCCESS: "✅",
    WARNING: "⚠️",
    ERROR: "❌"
  }
};


/* =========================================================
 *                    PLATFORM DETECTOR
 * ========================================================= */

function detectPlatform(url) {
  if (/tiktok\.com/i.test(url))
    return "TikTok";

  if (/facebook\.com|fb\.watch|fb\.com/i.test(url))
    return "Facebook";

  if (/instagram\.com|instagr\.am/i.test(url))
    return "Instagram";

  if (/youtube\.com|youtu\.be/i.test(url))
    return "YouTube";

  if (/x\.com|twitter\.com/i.test(url))
    return "Twitter / X";

  if (/pin\.it|pinterest\.com/i.test(url))
    return "Pinterest";

  return "Unknown";
}


/* =========================================================
 *                    SUPPORTED URL CHECK
 * ========================================================= */

function isSupportedUrl(url) {
  return /tiktok\.com|facebook\.com|fb\.watch|fb\.com|instagram\.com|instagr\.am|youtube\.com|youtu\.be|x\.com|twitter\.com|pin\.it|pinterest\.com/i.test(
    url
  );
}


/* =========================================================
 *                    URL EXTRACTOR
 * ========================================================= */

function findSupportedUrl(text) {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);

  if (!matches) return null;

  return (
    matches.find(url => isSupportedUrl(url)) || null
  );
}


/* =========================================================
 *                    REACTION HANDLER
 * ========================================================= */

function setReaction(api, messageID, reaction, threadID) {
  try {
    api.setMessageReaction(
      reaction,
      messageID,
      threadID,
      () => {},
      true
    );
  } catch (error) {
    console.error(
      `[AutoDL Reaction Error] ${error.message}`
    );
  }
}


/* =========================================================
 *                    FILE CLEANUP
 * ========================================================= */

async function cleanup(filePath) {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error(
      `[AutoDL Cleanup Error] ${error.message}`
    );
  }
}


/* =========================================================
 *                    MODULE
 * ========================================================= */

module.exports = {

  config: {
    name: "autodl",
    version: "9.0",
    author: "TanJil.4x",

    role: 0,
    category: "media",

    description: {
      en: "Automatically download videos from supported social media links."
    },

    guide: {
      en: "[video link]"
    }
  },


  /* =======================================================
   *                    COMMAND HANDLER
   * ======================================================= */

  onStart: async function ({ api, event, args }) {

    const link =
      args[0] ||
      findSupportedUrl(event.body || "");

    if (!link) {

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.WARNING,
        event.threadID
      );

      return api.sendMessage(
        "⚠️ Please provide a valid supported video link.",
        event.threadID,
        event.messageID
      );
    }

    await this.handleDownload({
      api,
      event,
      targetUrl: link
    });
  },


  /* =======================================================
   *                    AUTO LINK DETECTOR
   * ======================================================= */

  onChat: async function ({ api, event }) {

    const body = event.body
      ? event.body.trim()
      : "";

    // Ignore bot commands
    if (
      body.startsWith("/") ||
      body.startsWith("!") ||
      body.startsWith(".")
    ) {
      return;
    }

    const targetUrl =
      findSupportedUrl(body);

    if (!targetUrl) return;

    await this.handleDownload({
      api,
      event,
      targetUrl
    });
  },


  /* =======================================================
   *                    MAIN DOWNLOAD HANDLER
   * ======================================================= */

  handleDownload: async function ({
    api,
    event,
    targetUrl
  }) {

    const startTime = Date.now();

    const platform =
      detectPlatform(targetUrl);

    const filePath = path.join(
      CONFIG.CACHE_DIR,
      `autodl_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}.mp4`
    );


    try {

      /* ===================================================
       * STEP 1 — LOADING
       * =================================================== */

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.LOADING,
        event.threadID
      );


      /* ===================================================
       * CREATE CACHE DIRECTORY
       * =================================================== */

      await fs.ensureDir(
        CONFIG.CACHE_DIR
      );


      /* ===================================================
       * STEP 2 — API PROCESSING
       * =================================================== */

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.DOWNLOADING,
        event.threadID
      );


      const apiUrl =
        `${CONFIG.API_URL}?url=${encodeURIComponent(targetUrl)}`;


      /* ===================================================
       * API REQUEST
       * =================================================== */

      const response = await axios.get(
        apiUrl,
        {
          timeout: CONFIG.TIMEOUT.API,
          headers: {
            "User-Agent": CONFIG.USER_AGENT
          }
        }
      );


      /* ===================================================
       * VALIDATE RESPONSE
       * =================================================== */

      if (
        !response.data ||
        !response.data.success ||
        !response.data.url
      ) {

        setReaction(
          api,
          event.messageID,
          CONFIG.REACTIONS.WARNING,
          event.threadID
        );

        const errorMessage =
          response.data?.message ||
          "Unable to extract the video link.";

        return api.sendMessage(
`╭━━━〔 ⚠️ AUTO DOWNLOADER 〕━━━╮

⚠️ ${errorMessage}

🎬 Platform : ${platform}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          event.threadID,
          event.messageID
        );
      }


      /* ===================================================
       * GET VIDEO URL
       * =================================================== */

      const videoDownloadUrl =
        response.data.url;


      /* ===================================================
       * STEP 3 — PROCESSING
       * =================================================== */

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.PROCESSING,
        event.threadID
      );


      /* ===================================================
       * VIDEO DOWNLOAD
       * =================================================== */

      const videoResponse =
        await axios({
          method: "GET",

          url: videoDownloadUrl,

          responseType: "stream",

          timeout: CONFIG.TIMEOUT.VIDEO,

          headers: {
            "User-Agent":
              CONFIG.USER_AGENT
          }
        });


      const writer =
        fs.createWriteStream(
          filePath
        );


      videoResponse.data.pipe(
        writer
      );


      await new Promise(
        (resolve, reject) => {

          writer.on(
            "finish",
            resolve
          );

          writer.on(
            "error",
            reject
          );

          videoResponse.data.on(
            "error",
            reject
          );
        }
      );


      /* ===================================================
       * CALCULATE LATENCY
       * =================================================== */

      const latency =
        (
          (Date.now() - startTime) /
          1000
        ).toFixed(2);


      /* ===================================================
       * API INFORMATION
       * =================================================== */

      const platformName =
        response.data.platform ||
        platform;

      const developer =
        response.data.dev ||
        "TanJil.4x";

      const title =
        response.data.title ||
        null;

      const author =
        response.data.author ||
        response.data.uploader ||
        null;


      /* ===================================================
       * STEP 4 — SUCCESS REACTION
       * =================================================== */

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.SUCCESS,
        event.threadID
      );


      /* ===================================================
       * FINAL OUTPUT
       * =================================================== */

      let output =
`╭━━━〔 ⚡ AUTO DOWNLOADER 〕━━━╮

🎬 Platform  : ${platformName}
⚡ Status    : Downloaded Successfully
⏱️ Latency   : ${latency}s`;

      if (title) {
        output +=
          `\n🎞️ Title     : ${title}`;
      }

      if (author) {
        output +=
          `\n👤 Author    : ${author}`;
      }

      output +=
`
👨‍💻 Developer : ${developer}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;


      /* ===================================================
       * SEND VIDEO
       * =================================================== */

      api.sendMessage(
        {
          body: output,

          attachment:
            fs.createReadStream(
              filePath
            )
        },

        event.threadID,

        async (error) => {

          if (error) {

            console.error(
              "[AutoDL Upload Error]",
              error
            );

            setReaction(
              api,
              event.messageID,
              CONFIG.REACTIONS.ERROR,
              event.threadID
            );

            await api.sendMessage(
              "❌ Failed to send the video attachment.",
              event.threadID,
              event.messageID
            );

          }

          else {

            console.log(
              `[AutoDL] ${platformName} downloaded successfully in ${latency}s`
            );
          }


          /* =============================================
           * DELETE CACHE FILE
           * ============================================= */

          await cleanup(
            filePath
          );
        },

        event.messageID
      );

    }


    /* =====================================================
     *                    ERROR HANDLER
     * ===================================================== */

    catch (error) {

      console.error(
        "[AutoDL Error]",
        error
      );


      /* ===================================================
       * ERROR REACTION
       * =================================================== */

      setReaction(
        api,
        event.messageID,
        CONFIG.REACTIONS.ERROR,
        event.threadID
      );


      let errorMessage =
        "Download failed. Please try again.";


      /* ===================================================
       * ERROR TYPES
       * =================================================== */

      if (
        error.code ===
        "ECONNABORTED"
      ) {

        errorMessage =
          "Request timed out. Please try again.";
      }

      else if (
        error.response?.status === 404
      ) {

        errorMessage =
          "Video link is unavailable or expired.";
      }

      else if (
        error.response?.status === 429
      ) {

        errorMessage =
          "Too many requests. Please try again later.";
      }

      else if (
        error.response?.status >= 500
      ) {

        errorMessage =
          "Download server is currently unavailable.";
      }


      /* ===================================================
       * ERROR OUTPUT
       * =================================================== */

      await api.sendMessage(
`╭━━━〔 ❌ AUTO DOWNLOADER 〕━━━╮

❌ ${errorMessage}

🎬 Platform : ${platform}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        event.threadID,
        event.messageID
      );


      /* ===================================================
       * CLEANUP
       * =================================================== */

      await cleanup(
        filePath
      );
    }
  }
};
