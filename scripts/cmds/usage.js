const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

let commandUsage = [];
const prefixes = {};
const unlistedCommands = ["eval", "usage", "restart", "spamkick", "cmd"];
const maxBarsToShow = 30; // টপ ৩০ কমান্ড দেখাবে
const backgroundImageUrl = 'https://i.imgur.com/p5J3nWC.jpeg'; // তোমার ব্যাকগ্রাউন্ড

try {
  commandUsage = JSON.parse(fs.readFileSync('usage.json', 'utf8'));
} catch (error) {
  console.error('Error loading command usage data:', error);
}

module.exports = {
  config: {
    name: "usage",
    version: "2.2",
    author: "Amit Max ⚡",
    role: 0,
    shortDescription: { en: "Usage" },
    longDescription: { en: "View bot command usage statistics" },
    category: "admin",
    guide: { en: "{pn}" },
  },

  onStart: async function({ api, args, message, event, role }) {
    if (role != 2) return message.reply("Unauthorized Access");
    try {
      if (commandUsage.length === 0) return message.reply("No command usage data available.");

      commandUsage.sort((a, b) => b.usage - a.usage);
      const topCommands = commandUsage.slice(0, maxBarsToShow);
      const totalBars = topCommands.length;

      const barWidth = 50;
      const spacing = 25;
      const canvasWidth = (barWidth + spacing) * totalBars + 100;
      const canvasHeight = 500;

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // Background Image Load
      const background = await loadImage(backgroundImageUrl);
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // Dark overlay for better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Top Title
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("Amit Max Bot Usage Cmd (Top 30)", canvasWidth / 2, 40);

      // Y Axis Label
      ctx.save();
      ctx.translate(20, canvasHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText("Usage Count", 0, 0);
      ctx.restore();

      // X Axis Label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText("Commands", canvasWidth / 2, canvasHeight - 10);

      // Grid Lines
      const numGridLines = 5;
      const gridSpacing = (canvasHeight - 100) / numGridLines;
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 1;
      for (let i = 1; i <= numGridLines; i++) {
        const y = canvasHeight - 50 - (gridSpacing * i);
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvasWidth - 20, y);
        ctx.stroke();
      }

      // Bars
      let xPos = 70;
      const maxUsage = Math.max(...topCommands.map(cmd => cmd.usage));

      for (const cmd of topCommands) {
        const barHeight = (cmd.usage / maxUsage) * (canvasHeight - 150);

        const hue = Math.floor(Math.random() * 360);
        const barGradient = ctx.createLinearGradient(xPos, canvasHeight - barHeight - 60, xPos + barWidth, canvasHeight);
        barGradient.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
        barGradient.addColorStop(1, `hsl(${hue}, 50%, 70%)`);
        ctx.fillStyle = barGradient;

        ctx.fillRect(xPos, canvasHeight - barHeight - 60, barWidth, barHeight);

        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(xPos, canvasHeight - barHeight - 60, barWidth, barHeight);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cmd.name, xPos + barWidth / 2, canvasHeight - 30);
        ctx.fillText(cmd.usage, xPos + barWidth / 2, canvasHeight - barHeight - 70);

        xPos += barWidth + spacing;
      }

      const buffer = canvas.toBuffer('image/png');
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const cachedImagePath = path.join(cacheFolderPath, 'usage_chart.png');
      fs.writeFileSync(cachedImagePath, buffer);

      message.reply({
        body: "",
        attachment: fs.createReadStream(cachedImagePath),
      });
    } catch (error) {
      message.reaction("❌", event.messageID);
      message.reply(error.message);
    }
  },

  onChat: async function({ event, message }) {
    const text = event.body;
    if (!text) return;
    let prefix = prefixes[event.threadID];
    if (!prefix) {
      prefix = await global.utils.getPrefix(event.threadID);
      prefixes[event.threadID] = prefix;
    }

    if (text.startsWith(prefix)) {
      const commandText = text.slice(prefix.length).split(" ")[0].toLowerCase();
      if (unlistedCommands.includes(commandText)) return;

      const existingCommandIndex = commandUsage.findIndex(cmd => cmd.name === commandText);
      if (existingCommandIndex !== -1) {
        commandUsage[existingCommandIndex].usage++;
      } else {
        commandUsage.push({ name: commandText, usage: 1 });
      }

      saveCommandUsage();
    }
  }
};

function saveCommandUsage() {
  fs.writeFile('usage.json', JSON.stringify(commandUsage, null, 2), err => {
    if (err) {
      console.error('Error saving command usage:', err);
    } else {
      console.log('Command usage saved successfully.');
    }
  });
}
