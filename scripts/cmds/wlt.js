const { config } = global.GoatBot;
const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wlt",
    aliases: ["whitelistthread", "wt"],
    version: "3.0",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage threads allowed to use the bot (whitelist mode)"
    },
    category: "owner",
    guide: {
      en: `{pn} [add | -a | +] [tid...]
{pn} [remove | -r | -] [tid...]
{pn} [list | -l]
{pn} [mode | -m] <on|off>
{pn} [mode | -m] noti <on|off>`
    }
  },

  langs: {
    en: {
      added: `\n╭─✦✅ | Added %1 thread(s)\n%2`,
      alreadyAdmin: `╭✦⚠️ | Already added %1 thread(s)\n%2\n`,
      missingAdd: "⚠️ | Please enter thread ID(s) to add to whitelist",
      removed: `\n╭✦✅ | Removed %1 thread(s)\n%2`,
      notAdmin: `╭✦❎ | Not found in whitelist %1 thread(s)\n%2\n`,
      listAdmin: `╭✦✨ | Whitelisted Threads\n%1\n╰─────────────────⧕`,
      turnedOn: "✅ | Whitelist mode enabled: only allowed threads can use bot",
      turnedOff: "❎ | Whitelist mode disabled: all threads can use bot",
      turnedOnNoti: "✅ | Notification enabled for non-whitelisted threads",
      turnedOffNoti: "❎ | Notification disabled for non-whitelisted threads"
    }
  },

  onStart: async function ({ message, args, event, getLang, api, globalData }) {
    const configKey = "whiteListModeThread";
    const notiKey = "whiteListModeThreadNoti";

    let threadConfigData = await globalData.get(configKey);
    if (!threadConfigData) {
      await globalData.create(configKey, {
        data: { enable: false, whiteListThreadIds: [] }
      });
      threadConfigData = await globalData.get(configKey);
    }

    let notiConfigData = await globalData.get(notiKey);
    if (!notiConfigData) {
      await globalData.create(notiKey, { data: true });
      notiConfigData = await globalData.get(notiKey);
    }

    const threadConfig = threadConfigData.data;
    const notiStatus = notiConfigData.data;

    const devPath = path.join(process.cwd(), "config.dev.json");
    const mainPath = path.join(process.cwd(), "config.json");
    const configPath = existsSync(devPath) ? devPath : mainPath;

    const localConfig = JSON.parse(readFileSync(configPath, "utf8"));
    const localWhiteList =
      localConfig.whiteListModeThread?.whiteListThreadIds || [];

    const missingInGlobal = localWhiteList.filter(
      id => !threadConfig.whiteListThreadIds.includes(id)
    );
    if (missingInGlobal.length > 0) {
      threadConfig.whiteListThreadIds.push(...missingInGlobal);
      await globalData.set(configKey, { data: threadConfig });
    }

    const missingInLocal = threadConfig.whiteListThreadIds.filter(
      id => !localWhiteList.includes(id)
    );
    if (missingInLocal.length > 0) {
      localConfig.whiteListModeThread =
        localConfig.whiteListModeThread || {};
      localConfig.whiteListModeThread.whiteListThreadIds = Array.from(
        new Set([...localWhiteList, ...missingInLocal])
      );
      writeFileSync(JSON.stringify(localConfig, null, 2), "utf8");
    }

    global.GoatBot.config.whiteListModeThread = threadConfig;
    global.GoatBot.config.hideNotiMessage =
      global.GoatBot.config.hideNotiMessage || {};
    global.GoatBot.config.hideNotiMessage.whiteListModeThread = !notiStatus;
    writeFileSync(configPath, JSON.stringify(global.GoatBot.config, null, 2));

    switch (args[0]) {
      case "add":
      case "-a":
      case "+": {
        let tids = args.slice(1).filter(arg => /^\d+$/.test(arg));
        if (tids.length === 0) tids.push(event.threadID);

        const alreadyAdded = [];
        const newlyAdded = [];

        for (const tid of tids) {
          if (threadConfig.whiteListThreadIds.includes(tid))
            alreadyAdded.push(tid);
          else {
            threadConfig.whiteListThreadIds.push(tid);
            newlyAdded.push(tid);
          }
        }

        await globalData.set(configKey, { data: threadConfig });
        writeFileSync(
          configPath,
          JSON.stringify(global.GoatBot.config, null, 2),
          "utf8"
        );

        const nameMap = await Promise.all(
          tids.map(async tid => {
            const info = await api.getThreadInfo(tid).catch(() => null);
            return { tid, name: info?.threadName || "Not found" };
          })
        );

        return message.reply(
          (newlyAdded.length > 0
            ? getLang(
                "added",
                newlyAdded.length,
                nameMap
                  .filter(t => newlyAdded.includes(t.tid))
                  .map(t => `├‣ NAME: ${t.name}\n╰‣ ID: ${t.tid}`)
                  .join("\n")
              )
            : "") +
            (alreadyAdded.length > 0
              ? getLang(
                  "alreadyAdmin",
                  alreadyAdded.length,
                  alreadyAdded.map(tid => `╰‣ ID: ${tid}`).join("\n")
                )
              : "")
        );
      }

      case "remove":
      case "rm":
      case "-r":
      case "-": {
        let tids = args.slice(1).filter(arg => /^\d+$/.test(arg));
        if (tids.length === 0) tids.push(event.threadID);

        const removed = [];
        const notFound = [];

        for (const tid of tids) {
          const index = threadConfig.whiteListThreadIds.indexOf(tid);
          if (index !== -1) {
            threadConfig.whiteListThreadIds.splice(index, 1);
            removed.push(tid);
          } else notFound.push(tid);
        }

        await globalData.set(configKey, { data: threadConfig });
        writeFileSync(
          configPath,
          JSON.stringify(global.GoatBot.config, null, 2),
          "utf8"
        );

        const nameMap = await Promise.all(
          removed.map(async tid => {
            const info = await api.getThreadInfo(tid).catch(() => null);
            return { tid, name: info?.threadName || "Not found" };
          })
        );

        return message.reply(
          (removed.length > 0
            ? getLang(
                "removed",
                removed.length,
                nameMap
                  .map(t => `├‣ NAME: ${t.name}\n╰‣ ID: ${t.tid}`)
                  .join("\n")
              )
            : "") +
            (notFound.length > 0
              ? getLang(
                  "notAdmin",
                  notFound.length,
                  notFound.map(tid => `╰‣ ID: ${tid}`).join("\n")
                )
              : "")
        );
      }

      case "list":
      case "-l": {
        if (threadConfig.whiteListThreadIds.length === 0)
          return message.reply("⚠️ | No threads are whitelisted.");
        const nameMap = await Promise.all(
          threadConfig.whiteListThreadIds.map(async tid => {
            const info = await api.getThreadInfo(tid).catch(() => null);
            return { tid, name: info?.threadName || "Unknown" };
          })
        );
        return message.reply(
          getLang(
            "listAdmin",
            nameMap
              .map(t => `├‣ NAME: ${t.name}\n├‣ ID: ${t.tid}`)
              .join("\n")
          )
        );
      }

      case "mode":
      case "m":
      case "-m": {
        const isNotiChange = args[1] === "noti";
        const target = isNotiChange ? args[2] : args[1];
        if (!["on", "off"].includes(target))
          return message.reply("⚠️ | Please specify `on` or `off`.");
        const value = target === "on";
        if (isNotiChange) {
          await globalData.set(notiKey, { data: value });
          return message.reply(
            getLang(value ? "turnedOnNoti" : "turnedOffNoti")
          );
        } else {
          threadConfig.enable = value;
          await globalData.set(configKey, { data: threadConfig });
          writeFileSync(
            configPath,
            JSON.stringify(global.GoatBot.config, null, 2),
            "utf8"
          );
          return message.reply(getLang(value ? "turnedOn" : "turnedOff"));
        }
      }

      default:
        return message.reply(getLang("missingAdd"));
    }
  }
};