const mongoose = require("mongoose");

module.exports = {
  config: {
    name: "database",
    version: "2.0",
    author: "T A N J I L 🎀",
    role: 2,
    category: "system",
    aliases: ["dbstats", "mongodb"],
    description: { en: "Advanced MongoDB storage inspector and collection details analyzer." },
    guide: { en: "database | database details or -d" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return api.sendMessage("⚠️ [System Alert] MongoDB is currently offline or disconnected.", event.threadID, event.messageID);
      }

      const db = mongoose.connection.db;
      const dbStats = await db.stats();
      const subCommand = args[0] ? args[0].toLowerCase() : "";

      // ==================== DETAILS VIEW (New Premium Design) ====================
      if (subCommand === "details" || subCommand === "-d") {
        const collections = await db.listCollections().toArray();
        let detailsMsg = `╭──〔 📂 COLLECTION INSPECTOR 〕\n\n`;

        if (collections.length === 0) {
          detailsMsg += `❃ ⚠️ No active collections found.\n`;
        } else {
          for (let col of collections) {
            const colName = col.name;
            const count = await db.collection(colName).countDocuments();
            detailsMsg += `❃🪶 Target: ${colName}\n   └─ Records: ${count} Items\n`;
          }
        }
        detailsMsg += `\n╰──────────────────\n🔖 Author: TanJil.4x 🎀`;

        return api.sendMessage(detailsMsg, event.threadID, event.messageID);
      }

      // ==================== MAIN STATS VIEW (New Premium Design) ====================
      const dataSizeMB = (dbStats.dataSize / (1024 * 1024)).toFixed(2);
      const totalUsedMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);
      const indexSizeMB = (dbStats.indexSize / (1024 * 1024)).toFixed(2);

      const maxLimitMB = 512; 
      const usedPercentage = Math.min((totalUsedMB / maxLimitMB) * 100, 100).toFixed(2);
      const freeSpaceMB = Math.max(maxLimitMB - totalUsedMB, 0).toFixed(2);

      const filledBars = Math.round((usedPercentage / 100) * 10);
      const emptyBars = 10 - filledBars;
      const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);

      const collectionsCount = dbStats.collections;
      const documentsCount = dbStats.objects;

      const mainMsg = 
`╭──〔 🗄️ DATABASE METRICS 〕
│
❃ Status: Secured Cluster 🟢
❃ Collections: ${collectionsCount} Files
❃ Documents: ${documentsCount} Entries
❃ Data Size: ${dataSizeMB} MB
❃ Storage Used: ${totalUsedMB} MB / ${maxLimitMB} MB
❃ Index Size: ${indexSizeMB} MB
│
❃ Storage Meter: [${progressBar}] ${usedPercentage}%
❃ Free Space: ${freeSpaceMB} MB
│
╰──────────────────
💡 Tip: Use 'database details' to inspect collection files.

🔖 Author: TanJil.4x 🎀`;

      return api.sendMessage(mainMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error("Database Inspection Error:", err);
      return api.sendMessage(`❌ Failed to execute command: ${err.message}`, event.threadID, event.messageID);
    }
  },

  onChat: async function () {}
};
        
