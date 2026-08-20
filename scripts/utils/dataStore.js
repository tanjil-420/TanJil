/**
 * ============================================================
 * T A N J I L  BOT - MASTER DATA STORAGE SYSTEM
 * ============================================================
 *
 * MongoDB  = Primary database
 * JSON      = Local mirror / emergency fallback
 * Backups   = Automatic timestamped JSON backups
 *
 * IMPORTANT:
 * bot-data folder must be in the PROJECT ROOT.
 *
 * Structure:
 *
 * YourBot/
 * ├── scripts/
 * │   ├── cmds/
 * │   └── utils/
 * │       └── dataStore.js
 * │
 * └── bot-data/
 *     ├── users.json
 *     ├── diamond.json
 *     ├── bank.json
 *     ├── games.json
 *     └── backups/
 *
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// 1. MAIN DATA DIRECTORY
// ============================================================
//
// Railway:
// Set BOT_DATA_DIR to your Railway Volume mount path.
//
// Host/VPS:
// You can also set BOT_DATA_DIR to a permanent disk path.
//
// If BOT_DATA_DIR is not set, it will use:
// PROJECT_ROOT/bot-data
//

const DATA_DIR = process.env.BOT_DATA_DIR
  ? path.resolve(process.env.BOT_DATA_DIR)
  : path.join(process.cwd(), "bot-data");


// ============================================================
// 2. BACKUP DIRECTORY
// ============================================================

const BACKUP_DIR = path.join(DATA_DIR, "backups");


// ============================================================
// 3. AUTOMATIC FOLDER CREATOR
// ============================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
}


// Create main folders automatically
ensureDir(DATA_DIR);
ensureDir(BACKUP_DIR);

ensureDir(path.join(BACKUP_DIR, "users"));
ensureDir(path.join(BACKUP_DIR, "diamond"));
ensureDir(path.join(BACKUP_DIR, "bank"));
ensureDir(path.join(BACKUP_DIR, "games"));


// ============================================================
// 4. FILE PATH SYSTEM
// ============================================================
//
// Example:
//
// getFilePath("users.json")
//
// -> bot-data/users.json
//
// getFilePath("diamond.json")
//
// -> bot-data/diamond.json
//

function getFilePath(fileName) {

  const filePath = path.join(
    DATA_DIR,
    fileName
  );

  ensureDir(path.dirname(filePath));

  return filePath;
}


// ============================================================
// 5. BACKUP SYSTEM
// ============================================================
//
// Every time a JSON file is changed,
// the previous version is automatically backed up.
//

function createBackup(filePath) {

  try {

    if (!fs.existsSync(filePath)) {
      return;
    }

    const fileName = path.basename(filePath);

    let backupFolder = "general";

    if (fileName === "users.json") {
      backupFolder = "users";
    }

    else if (fileName === "diamond.json") {
      backupFolder = "diamond";
    }

    else if (fileName === "bank.json") {
      backupFolder = "bank";
    }

    else if (fileName === "games.json") {
      backupFolder = "games";
    }

    const backupPath = path.join(
      BACKUP_DIR,
      backupFolder
    );

    ensureDir(backupPath);

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");

    const backupFile = path.join(
      backupPath,
      `${fileName}.${timestamp}.bak`
    );

    fs.copyFileSync(
      filePath,
      backupFile
    );

    // Keep latest 50 backups
    const backups = fs.readdirSync(
      backupPath
    )
      .filter(file =>
        file.startsWith(fileName + ".")
      )
      .sort()
      .reverse();

    for (const oldBackup of backups.slice(50)) {

      try {

        fs.unlinkSync(
          path.join(
            backupPath,
            oldBackup
          )
        );

      } catch {}

    }

  } catch (error) {

    console.error(
      "❌ Backup Error:",
      error
    );

  }

}


// ============================================================
// 6. LOAD JSON
// ============================================================

function loadJSON(fileName) {

  const filePath =
    getFilePath(fileName);

  // File doesn't exist
  if (!fs.existsSync(filePath)) {

    saveJSON(
      fileName,
      {}
    );

    return {};

  }

  try {

    const raw =
      fs.readFileSync(
        filePath,
        "utf8"
      );

    if (!raw.trim()) {
      return {};
    }

    return JSON.parse(raw);

  }

  catch (error) {

    console.error(
      `❌ JSON ERROR: ${fileName}`,
      error
    );

    // Save corrupted copy
    try {

      const corruptedPath =
        filePath + ".corrupted";

      fs.copyFileSync(
        filePath,
        corruptedPath
      );

    } catch {}

    return {};

  }

}


// ============================================================
// 7. SAVE JSON
// ============================================================
//
// Uses temporary file first.
// This prevents half-written JSON files.
//

function saveJSON(fileName, data) {

  const filePath =
    getFilePath(fileName);

  const tempPath =
    filePath + ".tmp";

  try {

    // Backup old data before replacing
    if (fs.existsSync(filePath)) {
      createBackup(filePath);
    }

    // Write new data to temporary file
    fs.writeFileSync(
      tempPath,
      JSON.stringify(
        data,
        null,
        2
      ),
      "utf8"
    );

    // Replace old file
    fs.renameSync(
      tempPath,
      filePath
    );

    return true;

  }

  catch (error) {

    console.error(
      `❌ SAVE ERROR: ${fileName}`,
      error
    );

    try {

      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

    } catch {}

    return false;

  }

}


// ============================================================
// 8. UPDATE JSON
// ============================================================
//
// Example:
//
// updateJSON("diamond.json", data => {
//     data[userID] = 500;
// });
//

function updateJSON(fileName, callback) {

  const data =
    loadJSON(fileName);

  const result =
    callback(data);

  const finalData =
    result === undefined
      ? data
      : result;

  saveJSON(
    fileName,
    finalData
  );

  return finalData;

}


// ============================================================
// 9. DELETE JSON
// ============================================================

function deleteJSON(fileName) {

  const filePath =
    getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {

    createBackup(filePath);

    fs.unlinkSync(filePath);

    return true;

  }

  catch (error) {

    console.error(
      `❌ DELETE ERROR: ${fileName}`,
      error
    );

    return false;

  }

}


// ============================================================
// 10. USER DATA - JSON MIRROR
// ============================================================
//
// This is the important part.
//
// MongoDB can remain your primary database.
//
// JSON keeps a local copy of user data.
//
// Example:
//
// {
//   "123456": {
//      "name": "Tanjil",
//      "money": "5000"
//   }
// }
//

function getLocalUser(userID) {

  const users =
    loadJSON("users.json");

  return users[String(userID)] || null;

}


function saveLocalUser(userID, userData) {

  const users =
    loadJSON("users.json");

  users[String(userID)] = {
    ...(users[String(userID)] || {}),
    ...userData
  };

  saveJSON(
    "users.json",
    users
  );

  return users[String(userID)];

}


// ============================================================
// 11. GET USER
// ============================================================
//
// MongoDB is checked first.
//
// JSON is used as fallback.
//
// IMPORTANT:
// usersData is the GoatBot/MongoDB usersData object.
//

async function getUser(
  usersData,
  userID
) {

  const uid =
    String(userID);

  // ----------------------------------------------------------
  // Try MongoDB first
  // ----------------------------------------------------------

  if (usersData) {

    try {

      const mongoUser =
        await usersData.get(uid);

      if (mongoUser) {

        // Mirror MongoDB data into JSON
        saveLocalUser(
          uid,
          mongoUser
        );

        return mongoUser;

      }

    }

    catch (error) {

      console.error(
        "⚠️ MongoDB get failed, using JSON:",
        error.message
      );

    }

  }


  // ----------------------------------------------------------
  // MongoDB unavailable / user missing
  // Use JSON
  // ----------------------------------------------------------

  const localUser =
    getLocalUser(uid);

  if (localUser) {

    // Try restoring JSON data into MongoDB
    if (usersData) {

      try {

        await usersData.set(
          uid,
          localUser
        );

        console.log(
          `♻️ Restored user ${uid} from JSON`
        );

      }

      catch (error) {

        console.error(
          "⚠️ Could not restore MongoDB:",
          error.message
        );

      }

    }

    return localUser;

  }


  // ----------------------------------------------------------
  // No data anywhere
  // ----------------------------------------------------------

  return {
    userID: uid,
    name: "User",
    money: 0,
    data: {}
  };

}


// ============================================================
// 12. SET USER
// ============================================================
//
// MongoDB first.
// JSON mirror second.
//

async function setUser(
  usersData,
  userID,
  userData
) {

  const uid =
    String(userID);

  let mongoSuccess = false;

  // ----------------------------------------------------------
  // Save to MongoDB
  // ----------------------------------------------------------

  if (usersData) {

    try {

      await usersData.set(
        uid,
        userData
      );

      mongoSuccess = true;

    }

    catch (error) {

      console.error(
        "⚠️ MongoDB save failed:",
        error.message
      );

    }

  }


  // ----------------------------------------------------------
  // Always save JSON mirror
  // ----------------------------------------------------------

  saveLocalUser(
    uid,
    userData
  );

  return mongoSuccess;

}


// ============================================================
// 13. ADD MONEY
// ============================================================

async function addMoney(
  usersData,
  userID,
  amount
) {

  const user =
    await getUser(
      usersData,
      userID
    );

  const current =
    Number(user.money || 0);

  const newBalance =
    current + Number(amount);

  await setUser(
    usersData,
    userID,
    {
      money: newBalance.toString()
    }
  );

  return newBalance;

}


// ============================================================
// 14. SUBTRACT MONEY
// ============================================================

async function subtractMoney(
  usersData,
  userID,
  amount
) {

  const user =
    await getUser(
      usersData,
      userID
    );

  const current =
    Number(user.money || 0);

  const newBalance =
    current - Number(amount);

  await setUser(
    usersData,
    userID,
    {
      money: newBalance.toString()
    }
  );

  return newBalance;

}


// ============================================================
// 15. DIAMOND SYSTEM
// ============================================================

function getDiamond(userID) {

  const data =
    loadJSON("diamond.json");

  return Number(
    data[String(userID)] || 0
  );

}


function setDiamond(
  userID,
  amount
) {

  const data =
    loadJSON("diamond.json");

  data[String(userID)] =
    Number(amount);

  saveJSON(
    "diamond.json",
    data
  );

  return Number(amount);

}


function addDiamond(
  userID,
  amount
) {

  const current =
    getDiamond(userID);

  return setDiamond(
    userID,
    current + Number(amount)
  );

}


function removeDiamond(
  userID,
  amount
) {

  const current =
    getDiamond(userID);

  return setDiamond(
    userID,
    Math.max(
      0,
      current - Number(amount)
    )
  );

}


// ============================================================
// 16. GENERIC GAME DATA
// ============================================================

function getGameData() {

  return loadJSON(
    "games.json"
  );

}


function saveGameData(data) {

  return saveJSON(
    "games.json",
    data
  );

}


// ============================================================
// 17. BANK DATA
// ============================================================

function getBankData() {

  return loadJSON(
    "bank.json"
  );

}


function saveBankData(data) {

  return saveJSON(
    "bank.json",
    data
  );

}


// ============================================================
// 18. RESTORE ALL JSON USERS TO MONGODB
// ============================================================
//
// This can be called when MongoDB has been reset.
//
// It reads users.json and tries to restore
// every saved user into MongoDB.
//

async function restoreUsersToMongo(
  usersData
) {

  if (!usersData) {
    return false;
  }

  const users =
    loadJSON("users.json");

  let restored = 0;

  for (
    const [userID, userData]
    of Object.entries(users)
  ) {

    try {

      await usersData.set(
        userID,
        userData
      );

      restored++;

    }

    catch (error) {

      console.error(
        `❌ Restore failed for ${userID}:`,
        error.message
      );

    }

  }

  console.log(
    `♻️ JSON → MongoDB restore complete: ${restored} users`
  );

  return true;

}


// ============================================================
// 19. EXPORT
// ============================================================

module.exports = {

  // Paths
  DATA_DIR,
  BACKUP_DIR,
  getFilePath,

  // JSON
  loadJSON,
  saveJSON,
  updateJSON,
  deleteJSON,

  // Users
  getLocalUser,
  saveLocalUser,
  getUser,
  setUser,
  addMoney,
  subtractMoney,
  restoreUsersToMongo,

  // Diamond
  getDiamond,
  setDiamond,
  addDiamond,
  removeDiamond,

  // Game
  getGameData,
  saveGameData,

  // Bank
  getBankData,
  saveBankData

};
