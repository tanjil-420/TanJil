const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const path = require("path");

module.exports = {
  config: {
    name: "wl",
    aliases: ["wlonly", "onlywlst", "onlywhitelist", "whitelists"],
    version: "3.0",
    author: "NTKhang",
    countDown: 5,
    role: 1,
    description: { en: "Add, remove, edit whiteListIds role" },
    category: "owner",
    guide: {
      en: `{pn} [add | -a] <uid | @tag>
{pn} [remove | -r] <uid | @tag>
{pn} [list | -l]
{pn} -m [on | off]
{pn} -m noti [on | off]`
    }
  },

  langs: {
    en: {
      added: `╭✦✅ | Added %1 user(s)\n%2`,
      alreadyAdmin: `\n╭✦⚠️ | Already added %1 user(s)\n%2`,
      missingAdd: "⚠️ | Please enter UID to add whitelist role",
      removed: `╭✦✅ | Removed %1 user(s)\n%2`,
      notAdmin: `╭✦⚠️ | Not found in whitelist %1 user(s)\n%2`,
      missingIdRemove: "⚠️ | Please enter UID to remove whitelist role",
      listAdmin: `╭✦✨ | List of UserIDs\n%1\n╰───────────────────⧕`,
      turnedOn: "✅ | Mode only whitelistIds can use bot enabled",
      turnedOff: "❎ | Mode only whitelistIds can use bot disabled",
      turnedOnNoti: "✅ | Notification enabled for non-whitelist users",
      turnedOffNoti: "❎ | Notification disabled for non-whitelist users"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, globalData }) {
    const permission = config.adminBot;
    if (!permission.includes(event.senderID)) return;

    const userConfigKey = "whiteListMode";
    const userNotiKey = "whiteListModeNoti";

    const devPath = path.join(process.cwd(), "config.dev.json");
    const mainPath = path.join(process.cwd(), "config.json");
    const configPath = existsSync(devPath) ? devPath : mainPath;

    let localConfig = JSON.parse(readFileSync(configPath, "utf8"));

    let userWhiteListData = await globalData.get(userConfigKey);
    if (!userWhiteListData) {
      await globalData.create(userConfigKey, {
        data: {
          enable: config.whiteListMode?.enable || false,
          whiteListIds: config.whiteListMode?.whiteListIds || []
        }
      });
      userWhiteListData = await globalData.get(userConfigKey);
    }

    let userNotiData = await globalData.get(userNotiKey);
    if (!userNotiData) {
      await globalData.create(userNotiKey, { data: !config.hideNotiMessage?.whiteListMode || true });
      userNotiData = await globalData.get(userNotiKey);
    }

    const whiteListConfig = userWhiteListData.data;
    const notiStatus = userNotiData.data;

    const localWhiteList = localConfig.whiteListMode?.whiteListIds || [];

    const missingInGlobal = localWhiteList.filter(uid => !whiteListConfig.whiteListIds.includes(uid));
    if (missingInGlobal.length > 0) {
      whiteListConfig.whiteListIds.push(...missingInGlobal);
      await globalData.set(userConfigKey, { data: whiteListConfig });
    }

    const missingInLocal = whiteListConfig.whiteListIds.filter(uid => !localWhiteList.includes(uid));
    if (missingInLocal.length > 0) {
      localConfig.whiteListMode = localConfig.whiteListMode || {};
      localConfig.whiteListMode.whiteListIds = Array.from(new Set([...localWhiteList, ...missingInLocal]));
    }

    config.whiteListMode = whiteListConfig;
    config.hideNotiMessage = config.hideNotiMessage || {};
    config.hideNotiMessage.whiteListMode = !notiStatus;

    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    switch (args[0]) {
      case "add":
      case "-a":
      case "+": {
        if (!args[1]) return message.reply(getLang("missingAdd"));
        let uids = Object.keys(event.mentions).length > 0
          ? Object.keys(event.mentions)
          : event.messageReply
          ? [event.messageReply.senderID]
          : args.filter(arg => !isNaN(arg));
        const newlyAdded = [];
        const alreadyAdded = [];

        for (const uid of uids) {
          if (whiteListConfig.whiteListIds.includes(uid)) alreadyAdded.push(uid);
          else newlyAdded.push(uid);
        }

        whiteListConfig.whiteListIds.push(...newlyAdded);
        await globalData.set(userConfigKey, { data: whiteListConfig });
        config.whiteListMode = whiteListConfig;
        writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

        const getNames = await Promise.all(
          uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );

        return message.reply(
          (newlyAdded.length ? getLang("added", newlyAdded.length, getNames.filter(u => newlyAdded.includes(u.uid)).map(u => `├‣ NAME: ${u.name}\n├‣ ID: ${u.uid}`).join("\n")) : "") +
          (alreadyAdded.length ? getLang("alreadyAdmin", alreadyAdded.length, alreadyAdded.map(uid => `├‣ ID: ${uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "-r":
      case "rm":
      case "-": {
        if (!args[1]) return message.reply(getLang("missingIdRemove"));
        let uids = Object.keys(event.mentions).length > 0
          ? Object.keys(event.mentions)
          : event.messageReply
          ? [event.messageReply.senderID]
          : args.filter(arg => !isNaN(arg));
        const removed = [];
        const notFound = [];

        for (const uid of uids) {
          if (whiteListConfig.whiteListIds.includes(uid)) removed.push(uid);
          else notFound.push(uid);
        }

        for (const uid of removed) whiteListConfig.whiteListIds.splice(whiteListConfig.whiteListIds.indexOf(uid), 1);

        await globalData.set(userConfigKey, { data: whiteListConfig });
        config.whiteListMode = whiteListConfig;
        writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

        const getNames = await Promise.all(
          removed.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );

        return message.reply(
          (removed.length ? getLang("removed", removed.length, getNames.map(u => `├‣ NAME: ${u.name}\n├‣ ID: ${u.uid}`).join("\n")) : "") +
          (notFound.length ? getLang("notAdmin", notFound.length, notFound.map(uid => `├‣ ID: ${uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(
          whiteListConfig.whiteListIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );
        return message.reply(getLang("listAdmin", getNames.map(u => `├‣ NAME: ${u.name}\n├‣ ID: ${u.uid}`).join("\n")));
      }

      case "m":
      case "mode":
      case "-m": {
        let isNoti = args[1] === "noti";
        let value = args[isNoti ? 2 : 1] === "on";
        if (isNoti) {
          await globalData.set(userNotiKey, { data: value });
          config.hideNotiMessage.whiteListMode = !value;
          writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
          return message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
        } else {
          whiteListConfig.enable = value;
          await globalData.set(userConfigKey, { data: whiteListConfig });
          config.whiteListMode = whiteListConfig;
          writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
          return message.reply(getLang(value ? "turnedOn" : "turnedOff"));
        }
      }

      default:
        return;
    }
  }
};