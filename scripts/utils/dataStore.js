const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.BOT_DATA_DIR
  ? path.resolve(process.env.BOT_DATA_DIR)
  : path.join(process.cwd(), "bot-data");

const BACKUP_DIR = path.join(DATA_DIR, "backups");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(DATA_DIR);

for (const folder of ["users", "diamond", "bank", "games", "general"]) {
  ensureDir(path.join(BACKUP_DIR, folder));
}

function getFilePath(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  ensureDir(path.dirname(filePath));
  return filePath;
}

function getBackupFolder(fileName) {
  const name = path.basename(fileName);

  if (name === "users.json") return "users";
  if (name === "diamond.json") return "diamond";
  if (name === "bank.json") return "bank";
  if (name === "games.json") return "games";

  return "general";
}

function createBackup(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;

    const fileName = path.basename(filePath);
    const folder = path.join(
      BACKUP_DIR,
      getBackupFolder(fileName)
    );

    ensureDir(folder);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const backupPath = path.join(
      folder,
      `${fileName}.${timestamp}.bak`
    );

    fs.copyFileSync(filePath, backupPath);

    const backups = fs
      .readdirSync(folder)
      .filter(file => file.startsWith(`${fileName}.`))
      .sort()
      .reverse();

    for (const oldFile of backups.slice(50)) {
      try {
        fs.unlinkSync(path.join(folder, oldFile));
      } catch {}
    }

    return true;
  } catch (error) {
    console.error("Backup error:", error.message);
    return false;
  }
}

function loadJSON(fileName) {
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    saveJSON(fileName, {});
    return {};
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");

    if (!raw.trim()) {
      return {};
    }

    const data = JSON.parse(raw);

    if (
      data === null ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return {};
    }

    return data;
  } catch (error) {
    console.error(`JSON load error (${fileName}):`, error.message);

    try {
      const corruptedPath = `${filePath}.corrupted`;
      fs.copyFileSync(filePath, corruptedPath);
    } catch {}

    return {};
  }
}

function saveJSON(fileName, data) {
  const filePath = getFilePath(fileName);
  const tempPath = `${filePath}.tmp`;

  try {
    if (fs.existsSync(filePath)) {
      createBackup(filePath);
    }

    fs.writeFileSync(
      tempPath,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    fs.renameSync(tempPath, filePath);

    return true;
  } catch (error) {
    console.error(`JSON save error (${fileName}):`, error.message);

    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {}

    return false;
  }
}

function updateJSON(fileName, callback) {
  const data = loadJSON(fileName);
  const result = callback(data);
  const finalData = result === undefined ? data : result;

  saveJSON(fileName, finalData);

  return finalData;
}

function deleteJSON(fileName) {
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    createBackup(filePath);
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`JSON delete error (${fileName}):`, error.message);
    return false;
  }
}

function getData(fileName) {
  return loadJSON(fileName);
}

function setData(fileName, data) {
  return saveJSON(fileName, data);
}

function getLocalUser(userID) {
  const users = loadJSON("users.json");
  return users[String(userID)] || null;
}

function saveLocalUser(userID, userData) {
  const users = loadJSON("users.json");
  const uid = String(userID);

  users[uid] = {
    ...(users[uid] || {}),
    ...(userData || {})
  };

  saveJSON("users.json", users);

  return users[uid];
}

async function getUser(usersData, userID) {
  const uid = String(userID);

  if (usersData) {
    try {
      const mongoUser = await usersData.get(uid);

      if (mongoUser) {
        saveLocalUser(uid, mongoUser);
        return mongoUser;
      }
    } catch (error) {
      console.error(
        "MongoDB get failed, using JSON:",
        error.message
      );
    }
  }

  const localUser = getLocalUser(uid);

  if (localUser) {
    if (usersData) {
      try {
        await usersData.set(uid, localUser);
      } catch (error) {
        console.error(
          "MongoDB restore failed:",
          error.message
        );
      }
    }

    return localUser;
  }

  return {
    userID: uid,
    name: "User",
    money: "0",
    data: {}
  };
}

async function setUser(usersData, userID, userData) {
  const uid = String(userID);
  let mongoSuccess = false;

  if (usersData) {
    try {
      await usersData.set(uid, userData);
      mongoSuccess = true;
    } catch (error) {
      console.error(
        "MongoDB save failed:",
        error.message
      );
    }
  }

  saveLocalUser(uid, userData);

  return mongoSuccess;
}

async function addMoney(usersData, userID, amount) {
  const user = await getUser(usersData, userID);
  const current = Number(user.money || 0);
  const newBalance = current + Number(amount);

  await setUser(usersData, userID, {
    money: String(newBalance)
  });

  return newBalance;
}

async function subtractMoney(usersData, userID, amount) {
  const user = await getUser(usersData, userID);
  const current = Number(user.money || 0);
  const newBalance = current - Number(amount);

  await setUser(usersData, userID, {
    money: String(newBalance)
  });

  return newBalance;
}

function getDiamond(userID) {
  const data = loadJSON("diamond.json");
  return Number(data[String(userID)] || 0);
}

function setDiamond(userID, amount) {
  const data = loadJSON("diamond.json");
  const uid = String(userID);
  const value = Number(amount);

  data[uid] = value;

  saveJSON("diamond.json", data);

  return value;
}

function addDiamond(userID, amount) {
  const current = getDiamond(userID);
  return setDiamond(
    userID,
    current + Number(amount)
  );
}

function removeDiamond(userID, amount) {
  const current = getDiamond(userID);
  return setDiamond(
    userID,
    Math.max(0, current - Number(amount))
  );
}

function getGameData() {
  return loadJSON("games.json");
}

function saveGameData(data) {
  return saveJSON("games.json", data);
}

function getBankData() {
  return loadJSON("bank.json");
}

function saveBankData(data) {
  return saveJSON("bank.json", data);
}

async function restoreUsersToMongo(usersData) {
  if (!usersData) {
    return false;
  }

  const users = loadJSON("users.json");
  let restored = 0;

  for (const [userID, userData] of Object.entries(users)) {
    try {
      await usersData.set(userID, userData);
      restored++;
    } catch (error) {
      console.error(
        `Restore failed for ${userID}:`,
        error.message
      );
    }
  }

  console.log(
    `JSON → MongoDB restore complete: ${restored} users`
  );

  return true;
}

module.exports = {
  DATA_DIR,
  BACKUP_DIR,
  getFilePath,

  loadJSON,
  saveJSON,
  getData,
  setData,
  updateJSON,
  deleteJSON,

  getLocalUser,
  saveLocalUser,
  getUser,
  setUser,
  addMoney,
  subtractMoney,
  restoreUsersToMongo,

  getDiamond,
  setDiamond,
  addDiamond,
  removeDiamond,

  getGameData,
  saveGameData,

  getBankData,
  saveBankData
};
