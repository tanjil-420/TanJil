const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");
const axios = require("axios");

let games = {};

/* ===================== RENDER BOARD ===================== */
function renderBoard(board, playerXName, playerOName, statusText = "", winnerLine = null) {
  const canvas = createCanvas(400, 500);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0f0f1a";
  ctx.fillRect(0, 0, 400, 500);

  ctx.fillStyle = "#8e44ad";
  ctx.fillRect(0, 0, 400, 60);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `${playerXName.slice(0, 12)} (X) 🆚 ${playerOName.slice(0, 12)} (O)`,
    200,
    35
  );

  ctx.strokeStyle = "#9b59b6";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(133, 70); ctx.lineTo(133, 430);
  ctx.moveTo(266, 70); ctx.lineTo(266, 430);
  ctx.moveTo(0, 170); ctx.lineTo(400, 170);
  ctx.moveTo(0, 300); ctx.lineTo(400, 300);
  ctx.stroke();

  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * 133 + 67;
    const y = Math.floor(i / 3) * 130 + 120;

    if (board[i] === "X") {
      ctx.fillStyle = "#3498db";
      ctx.fillText("X", x, y);
    } else if (board[i] === "O") {
      ctx.fillStyle = "#e67e22";
      ctx.fillText("O", x, y);
    }
  }

  if (winnerLine) {
    const pos = i => ({
      x: (i % 3) * 133 + 67,
      y: Math.floor(i / 3) * 130 + 120
    });
    const s = pos(winnerLine[0]);
    const e = pos(winnerLine[2]);
    ctx.strokeStyle = "#39ff14";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.fillText(statusText, 200, 470);

  return canvas.toBuffer();
}

/* ===================== WIN CHECK ===================== */
function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const l of wins) {
    const [a,b,c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: l };
    }
  }
  if (board.every(v => v)) return { winner: "draw", line: null };
  return null;
}

/* ===================== TIMER ===================== */
function resetTimer(gameId, message) {
  const game = games[gameId];
  if (!game || game.ended) return;

  if (game.timeout) clearTimeout(game.timeout);

  game.timeout = setTimeout(async () => {
    await unsendAll(game, message);
    delete games[gameId];
    message.reply("⏰ Time is up! Game cancelled.");
  }, 60000);
}

/* ===================== BOT MOVE ===================== */
function botSmartMove(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const l of lines) {
    const v = l.map(i => board[i]);
    if (v.filter(x => x === "O").length === 2 && v.includes(null))
      return l[v.indexOf(null)];
  }

  for (const l of lines) {
    const v = l.map(i => board[i]);
    if (v.filter(x => x === "X").length === 2 && v.includes(null))
      return l[v.indexOf(null)];
  }

  if (!board[4]) return 4;
  const c = [0,2,6,8].filter(i => !board[i]);
  if (c.length) return c[Math.floor(Math.random() * c.length)];
  const s = [1,3,5,7].filter(i => !board[i]);
  if (s.length) return s[Math.floor(Math.random() * s.length)];
  return null;
}

/* ===================== HELPERS ===================== */
async function unsendAll(game, message) {
  if (!game.msgIds) return;
  for (const id of game.msgIds) {
    try { await message.unsend(id); } catch {}
  }
}

async function getBoardImage(board, x, o, status, line) {
  try {
    const b = board.map(v => v || " ").join("");
    let url = `https://ttt-api-50dt.onrender.com/tanjil-api?board=${encodeURIComponent(b)}`;
    if (line) url += `&winner=${line.join(",")}`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(res.data);
  } catch {
    return renderBoard(board, x, o, status, line);
  }
}

function saveImage(buf) {
  const p = path.join(__dirname, `ttt_${Date.now()}.png`);
  fs.writeFileSync(p, buf);
  return p;
}
function deleteFile(p) {
  if (p && fs.existsSync(p)) fs.unlinkSync(p);
}

/* ===================== COMMAND ===================== */
module.exports = {
  config: {
    name: "ttt",
    aliases: ["tic-tac-toe"],
    version: "8.0",
    author: "T A N J I L 🎀",
    role: 0,
    shortDescription: "Tic Tac Toe game",
    guide: { en: "/ttt @mention OR /ttt -a" }
  },

  onStart: async function({ message, event, usersData, args }) {
    const threadID = event.threadID;
    if (games[threadID]) return message.reply("⚠️ Game already running!");

    let X = event.senderID;
    let O, isBot = false;

    if (args[0] === "-a") {
      O = "BOT";
      isBot = true;
    } else {
      const m = Object.keys(event.mentions || {});
      if (!m.length) return message.reply("❌ /ttt @mention , /ttt -a");
      O = m[0];
    }

    games[threadID] = {
      board: Array(9).fill(null),
      players: { X, O },
      names: {
        X: await usersData.getName(X),
        O: isBot ? "Smart Bot 🤖" : await usersData.getName(O)
      },
      turn: "X",
      isBot,
      msgIds: [],
      timeout: null,
      ended: false,
      lastImagePath: null
    };

    resetTimer(threadID, message);
    await sendUpdate(message, games[threadID], null);
  },

  onChat: async function({ message, event }) {
    const game = games[event.threadID];
    if (!game || game.ended) return;

    if (!/^[1-9]$/.test(event.body)) return;
    const move = Number(event.body) - 1;

    const player = Object.keys(game.players).find(k => game.players[k] === event.senderID);
    if (!player || game.turn !== player) return;

    if (game.board[move]) return message.reply("❌ Cell filled!");

    game.board[move] = player;
    game.turn = player === "X" ? "O" : "X";

    let result = checkWinner(game.board);

    if (game.isBot && !result) {
      const b = botSmartMove(game.board);
      if (b !== null) game.board[b] = "O";
      game.turn = "X";
      result = checkWinner(game.board);
    }

    resetTimer(event.threadID, message);
    await sendUpdate(message, game, result);

    if (result) {
      game.ended = true;
      if (game.timeout) clearTimeout(game.timeout);
      setTimeout(() => {
        deleteFile(game.lastImagePath);
        delete games[event.threadID];
      }, 3000);
    }
  }
};

/* ===================== UPDATE BOARD ===================== */
async function sendUpdate(message, game, result) {
  deleteFile(game.lastImagePath);
  await unsendAll(game, message);

  const status = result
    ? (result.winner === "draw" ? "🤝 Draw!" : `🏆 Winner: ${game.names[result.winner]}`)
    : `👉 Turn: ${game.names[game.turn]} (${game.turn})`;

  const buf = await getBoardImage(game.board, game.names.X, game.names.O, status, result?.line);
  const img = saveImage(buf);

  const sent = await message.reply({
    body: status,
    attachment: fs.createReadStream(img)
  });

  game.msgIds = [sent.messageID];
  game.lastImagePath = img;
    }
