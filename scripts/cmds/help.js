const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "〲٭⃝✨⃝YOUR 卝 চুন্নি ⃝✨⃝٭";


module.exports = {

  config: {
    name: "help",
    version: "3.0.0",
    author: "T A N J I L 🎀",

    countDown: 3,
    role: 0,

    shortDescription: {
      en: "View, search and explore bot commands"
    },

    longDescription: {
      en: "View commands by page, category, author or keyword and display detailed command information."
    },

    category: "info",

    guide: {
      en:
        "{pn} [empty | <page number> | <command name>]" +
        "\n {pn} -<category>: show all commands in that category" +
        "\n {pn} <command name> [-u | usage | -g | guide]: only show command usage" +
        "\n {pn} <command name> [-i | info]: only show command info" +
        "\n {pn} <command name> [-r | role]: only show command role" +
        "\n {pn} <command name> [-a | alias]: only show command alias" +
        "\n {pn} category|c|-c|cat <name>: commands in category" +
        "\n {pn} search|sr|-s|find <word>: search commands" +
        "\n {pn} author|by <name>: commands by author"
    },

    priority: 1
  },


  /* =======================================================
   *                         LANG
   * ======================================================= */

  langs: {

    en: {

      help: "",

      help2: "",

      commandNotFound:
        `Command "%1" does not exist`,

      getInfoCommand:
        `֎                                              ֍
         🪶 %1 FILE INFO...\n\n✍️ Author: %8\n📦 Version: %5\n🎭 Role: %6\n🌊 Aliases: %3\n⏱ Countdown: %7s\n📂 Category: %10\n📝 Description: %2\n👑 Other names in your group: %4\n🛠 USAGE: %9\n\n֎                                              ֍`,

      onlyInfo:
        `֎                                              ֍
                  🪶 INFO\n\n🌊 Command name: %1\n📝 Description: %2\n📓 Aliases: %3\n👑 Other names in your group: %4\n📦 Version: %5\n🎭 Role: %6\n⏳ Countdown: %7s\n🪶 Author:%8\n\n֎                                              ֍`,

      onlyUsage:
        `֎                                              ֍\n\n🛠 Usage: %1\n\n֎                                              ֍`,

      onlyAlias:
        `֎                                              ֍\n\n🪶 Aliases: %1\nOther names in your group: %2\n\n֎                                              ֍`,

      onlyRole:
        `֎                                              ֍\n\n🌊 Role: %1\n\n֎                                              ֍`,

      doNotHave:
        "Do not have",

      roleText0:
        "0 (All users)",

      roleText1:
        "1 (Group administrators)",

      roleText2:
        "2 (Admin bot)",

      roleText0setRole:
        "0 (set role, all users)",

      roleText1setRole:
        "1 (set role, group administrators)",

      pageNotFound:
        "Page %1 does not exist"
    }
  },


  /* =======================================================
   *                       MAIN
   * ======================================================= */

  onStart: async function ({
    message,
    args,
    event,
    threadsData,
    getLang,
    role
  }) {

    /* -------------------------------------------------------
     * Language
     * ------------------------------------------------------- */

    const langCode =
      await threadsData.get(
        event.threadID,
        "data.lang"
      ) ||
      global.GoatBot.config.language;


    let customLang = {};

    const pathCustomLang =
      path.normalize(
        `${process.cwd()}/languages/cmds/${langCode}.js`
      );


    if (fs.existsSync(pathCustomLang)) {
      customLang = require(pathCustomLang);
    }


    /* -------------------------------------------------------
     * Thread information
     * ------------------------------------------------------- */

    const { threadID } = event;

    const threadData =
      await threadsData.get(threadID);

    const prefix =
      getPrefix(threadID);


    /* -------------------------------------------------------
     * Help sorting
     * ------------------------------------------------------- */

    let sortHelp =
      threadData.settings?.sortHelp ||
      "category";


    if (
      !["category", "name"].includes(sortHelp)
    ) {
      sortHelp = "name";
    }


    const commandInput =
      (args[0] || "").toLowerCase();


    const command =
      commands.get(commandInput) ||
      commands.get(
        aliases.get(commandInput)
      );


    /* =====================================================
     * FIRST FILE FEATURE
     * CATEGORY ALIASES
     * ===================================================== */

    const categoryAliases = [
      "category",
      "c",
      "-c",
      "cat"
    ];


    const searchAliases = [
      "search",
      "sr",
      "-s",
      "find"
    ];


    const authorAliases = [
      "author",
      "by"
    ];


    /* =====================================================
     * CATEGORY SEARCH
     * ===================================================== */

    if (
      categoryAliases.includes(commandInput) &&
      args[1]
    ) {

      return sendCategoryCommands(
        message,
        args[1].toLowerCase(),
        role
      );
    }


    /* =====================================================
     * SEARCH COMMANDS
     * ===================================================== */

    if (
      searchAliases.includes(commandInput) &&
      args.slice(1).length
    ) {

      return searchCommands(
        message,
        args.slice(1).join(" ").toLowerCase(),
        role
      );
    }


    /* =====================================================
     * AUTHOR SEARCH
     * ===================================================== */

    if (
      authorAliases.includes(commandInput) &&
      args.slice(1).length
    ) {

      return searchByAuthor(
        message,
        args.slice(1).join(" "),
        role
      );
    }


    /* =====================================================
     * SECOND FILE CATEGORY SYSTEM
     *
     * Example:
     * !help -media
     * !help -fun
     * !help -admin
     * ===================================================== */

    if (
      !command &&
      args[0] &&
      args[0].startsWith("-") &&
      isNaN(args[0])
    ) {

      const categoryInput =
        args[0]
          .slice(1)
          .toLowerCase();


      const categoryCommands = [];


      for (
        const [, value]
        of commands
      ) {

        if (
          value.config.role > 1 &&
          role < value.config.role
        ) {
          continue;
        }


        const cat =
          (
            value.config?.category ||
            "no category"
          ).toLowerCase();


        if (
          cat === categoryInput
        ) {

          categoryCommands.push(
            value.config.name
          );
        }
      }


      if (
        categoryCommands.length === 0
      ) {

        return message.reply(
          `❌ Category "${categoryInput}" Not found`
        );
      }


      const msg =
        `| ${categoryInput.toUpperCase()} |\n` +
        `| ❃ ${categoryCommands.sort().join(" ❃ ")}\n`;


      return message.reply(msg);
    }


    /* =====================================================
     * PAGE / ALL COMMANDS
     * ===================================================== */

    if (
      !command &&
      (
        !args[0] ||
        !isNaN(args[0])
      )
    ) {

      const arrayInfo = [];

      let msg = "";


      /* ---------------------------------------------------
       * SORT BY NAME
       * --------------------------------------------------- */

      if (
        sortHelp === "name"
      ) {

        const page =
          parseInt(args[0]) || 1;


        const numberOfOnePage =
          30;


        for (
          const [name, value]
          of commands
        ) {

          if (
            value.config.role > 1 &&
            role < value.config.role
          ) {
            continue;
          }


          let describe = name;

          let shortDescription;


          const shortDescriptionCustomLang =
            customLang[name]?.shortDescription;


          if (
            shortDescriptionCustomLang !==
            undefined
          ) {

            shortDescription =
              checkLangObject(
                shortDescriptionCustomLang,
                langCode
              );

          }

          else if (
            value.config.shortDescription
          ) {

            shortDescription =
              checkLangObject(
                value.config.shortDescription,
                langCode
              );
          }


          if (shortDescription) {

            describe +=
              `: ${cropContent(
                shortDescription
                  .charAt(0)
                  .toUpperCase() +
                shortDescription.slice(1),
                50
              )}`;
          }


          arrayInfo.push({
            data: describe,
            priority:
              value.priority || 0
          });
        }


        arrayInfo.sort(
          (a, b) =>
            a.data.localeCompare(b.data)
        );


        arrayInfo.sort(
          (a, b) =>
            a.priority > b.priority
              ? -1
              : 1
        );


        const {
          allPage,
          totalPage
        } =
          global.utils.splitPage(
            arrayInfo,
            numberOfOnePage
          );


        if (
          page < 1 ||
          page > totalPage
        ) {

          return message.reply(
            getLang(
              "pageNotFound",
              page
            )
          );
        }


        const returnArray =
          allPage[page - 1] || [];


        const startNumber =
          (page - 1) *
            numberOfOnePage +
          1;


        msg +=
          returnArray
            .reduce(
              (
                text,
                item,
                index
              ) =>
                text +=
                  `✵${index + startNumber}` +
                  `${index + startNumber < 10 ? " " : ""}. ` +
                  `「${item.data}」\n`,
              ""
            )
            .slice(0, -1);


        return message.reply(
          getLang(
            "help",
            msg,
            page,
            totalPage,
            commands.size,
            prefix,
            doNotDelete
          )
        );
      }


      /* ---------------------------------------------------
       * SORT BY CATEGORY
       * --------------------------------------------------- */

      else if (
        sortHelp === "category"
      ) {

        for (
          const [, value]
          of commands
        ) {

          if (
            value.config.role > 1 &&
            role < value.config.role
          ) {
            continue;
          }


          const indexCategory =
            arrayInfo.findIndex(
              item =>
                (
                  item.category ||
                  "NO CATEGORY"
                ) ===
                (
                  value.config?.category
                    ?.toLowerCase() ||
                  "no category"
                )
            );


          if (
            indexCategory !== -1
          ) {

            arrayInfo[
              indexCategory
            ].names.push(
              value.config.name
            );

          }

          else {

            arrayInfo.push({
              category:
                value.config?.category
                  ?.toLowerCase() ||
                "no category",

              names: [
                value.config.name
              ]
            });
          }
        }


        arrayInfo.sort(
          (a, b) =>
            a.category.localeCompare(
              b.category
            )
        );


        msg =
          arrayInfo
            .map(
              data =>
                `| ${data.category.toUpperCase()} |\n` +
                `| ❃ \n` +
                `| ❃ ${data.names.sort().join(" ❃ ")}\n`
            )
            .join("\n");


        msg +=
          `\n\n⚒ Bot has: ${commands.size} Commands` +
          `\n🛸 Prefix: ${prefix}` +
          `\n👑 Owner: ♡ TANJIL ♡`;


        return message.reply(msg);
      }
    }


    /* =====================================================
     * COMMAND NOT FOUND
     * ===================================================== */

    if (
      !command &&
      args[0]
    ) {

      return message.reply(
        getLang(
          "commandNotFound",
          args[0]
        )
      );
    }


    /* =====================================================
     * COMMAND DETAILS
     * ===================================================== */

    const formSendMessage = {};

    const configCommand =
      command.config;


    /* -----------------------------------------------------
     * Guide
     * ----------------------------------------------------- */

    let guide =
      configCommand.guide?.[langCode] ||
      configCommand.guide?.["en"];


    if (
      guide === undefined
    ) {

      guide =
        customLang[
          configCommand.name
        ]?.guide?.[langCode] ||
        customLang[
          configCommand.name
        ]?.guide?.["en"];
    }


    guide =
      guide || {
        body: ""
      };


    if (
      typeof guide === "string"
    ) {

      guide = {
        body: guide
      };
    }


    const guideBody =
      guide.body
        .replace(
          /\{prefix\}|\{p\}/g,
          prefix
        )
        .replace(
          /\{name\}|\{n\}/g,
          configCommand.name
        )
        .replace(
          /\{pn\}/g,
          prefix +
          configCommand.name
        );


    /* -----------------------------------------------------
     * Aliases
     * ----------------------------------------------------- */

    const aliasesString =
      configCommand.aliases
        ? configCommand.aliases.join(", ")
        : getLang("doNotHave");


    const aliasesThisGroup =
      threadData.data?.aliases
        ? (
            threadData.data.aliases[
              configCommand.name
            ] || []
          ).join(", ")
        : getLang("doNotHave");


    /* -----------------------------------------------------
     * Role
     * ----------------------------------------------------- */

    let roleOfCommand =
      configCommand.role;


    let roleIsSet = false;


    if (
      threadData.data?.setRole?.[
        configCommand.name
      ]
    ) {

      roleOfCommand =
        threadData.data.setRole[
          configCommand.name
        ];

      roleIsSet = true;
    }


    const roleText =
      roleOfCommand == 0
        ? (
            roleIsSet
              ? getLang(
                  "roleText0setRole"
                )
              : getLang(
                  "roleText0"
                )
          )

        : roleOfCommand == 1

          ? (
              roleIsSet
                ? getLang(
                    "roleText1setRole"
                  )
                : getLang(
                    "roleText1"
                  )
            )

          : getLang(
              "roleText2"
            );


    /* -----------------------------------------------------
     * Author
     * ----------------------------------------------------- */

    const author =
      configCommand.author ||
      "Unknown";


    /* -----------------------------------------------------
     * Description
     * ----------------------------------------------------- */

    const descriptionCustomLang =
      customLang[
        configCommand.name
      ]?.longDescription;


    let description =
      checkLangObject(
        configCommand.longDescription,
        langCode
      );


    if (
      description === undefined
    ) {

      if (
        descriptionCustomLang !==
        undefined
      ) {

        description =
          checkLangObject(
            descriptionCustomLang,
            langCode
          );

      }

      else if (
        configCommand.description
      ) {

        description =
          checkLangObject(
            configCommand.description,
            langCode
          );

      }

      else {

        description =
          getLang("doNotHave");
      }
    }


    /* -----------------------------------------------------
     * Category
     * ----------------------------------------------------- */

    const category =
      configCommand.category ||
      "No category";


    /* -----------------------------------------------------
     * EXTRA FEATURES FROM FIRST FILE
     * ----------------------------------------------------- */

    const shortDescription =
      checkLangObject(
        configCommand.shortDescription,
        langCode
      ) ||
      "No short description available.";


    const usePrefix =
      usePrefixOk(
        configCommand.usePrefix
      );


    const isPremium =
      isPremiumOk(
        configCommand.isPremium
      );


    const requiredMoney =
      MoneyOk(
        configCommand.requiredMoney
      );


    /* =====================================================
     * SPECIAL INFO COMMANDS
     * ===================================================== */

    let sendWithAttachment =
      false;


    /* -----------------------------------------------------
     * USAGE
     *
     * -g
     * guide
     * -u
     * usage
     * ----------------------------------------------------- */

    if (
      args[1]?.match(
        /^-g|guide|-u|usage$/
      )
    ) {

      formSendMessage.body =
        getLang(
          "onlyUsage",
          guideBody
            .split("\n")
            .join("\n✵")
        );


      sendWithAttachment =
        true;
    }


    /* -----------------------------------------------------
     * ALIAS
     *
     * -a
     * alias
     * aliases
     * ----------------------------------------------------- */

    else if (
      args[1]?.match(
        /^-a|alias|aliase|aliases$/
      )
    ) {

      formSendMessage.body =
        getLang(
          "onlyAlias",
          aliasesString,
          aliasesThisGroup
        );
    }


    /* -----------------------------------------------------
     * ROLE
     * ----------------------------------------------------- */

    else if (
      args[1]?.match(
        /^-r|role$/
      )
    ) {

      formSendMessage.body =
        getLang(
          "onlyRole",
          roleText
        );
    }


    /* -----------------------------------------------------
     * INFO ONLY
     *
     * -i
     * info
     * ----------------------------------------------------- */

    else if (
      args[1]?.match(
        /^-i|info$/
      )
    ) {

      formSendMessage.body =
        getLang(
          "onlyInfo",

          configCommand.name,

          description,

          aliasesString,

          aliasesThisGroup,

          configCommand.version,

          roleText,

          configCommand.countDown || 1,

          author
        );


      sendWithAttachment =
        true;
    }


    /* -----------------------------------------------------
     * FULL COMMAND INFORMATION
     * ----------------------------------------------------- */

    else {

      formSendMessage.body =
        getLang(
          "getInfoCommand",

          configCommand.name,       // %1
          description,              // %2
          aliasesString,            // %3
          aliasesThisGroup,         // %4
          configCommand.version,    // %5
          roleText,                 // %6
          configCommand.countDown || 1, // %7
          author,                   // %8
          `${guideBody
            .split("\n")
            .join("\n»")}`,         // %9
          category                 // %10
        );


      /*
       * Add extra information from
       * FIRST help.js without changing
       * SECOND file's font/design.
       */

      formSendMessage.body +=
        `\n\n🔹 Short Description: ${shortDescription}` +
        `\n🔹 usePrefix: ${usePrefix}` +
        `\n🔹 isPremium: ${isPremium}` +
        `\n🔹 requiredMoney: ${requiredMoney}`;


      sendWithAttachment =
        true;
    }


    /* =====================================================
     * GUIDE ATTACHMENT SUPPORT
     * ===================================================== */

    if (
      sendWithAttachment &&
      guide.attachment
    ) {

      if (
        typeof guide.attachment === "object" &&
        !Array.isArray(
          guide.attachment
        )
      ) {

        const promises = [];

        formSendMessage.attachment = [];


        for (
          const keyPathFile
          in guide.attachment
        ) {

          const pathFile =
            path.normalize(
              keyPathFile
            );


          if (
            !fs.existsSync(pathFile)
          ) {

            const cutDirPath =
              path
                .dirname(pathFile)
                .split(path.sep);


            for (
              let i = 0;
              i < cutDirPath.length;
              i++
            ) {

              const pathCheck =
                `${cutDirPath
                  .slice(
                    0,
                    i + 1
                  )
                  .join(path.sep)}${path.sep}`;


              if (
                !fs.existsSync(
                  pathCheck
                )
              ) {

                fs.mkdirSync(
                  pathCheck
                );
              }
            }


            const getFilePromise =
              axios.get(
                guide.attachment[
                  keyPathFile
                ],
                {
                  responseType:
                    "arraybuffer"
                }
              )
              .then(
                response =>
                  fs.writeFileSync(
                    pathFile,
                    Buffer.from(
                      response.data
                    )
                  )
              );


            promises.push({
              pathFile,
              getFilePromise
            });

          }

          else {

            promises.push({
              pathFile,
              getFilePromise:
                Promise.resolve()
            });
          }
        }


        await Promise.all(
          promises.map(
            item =>
              item.getFilePromise
          )
        );


        for (
          const item
          of promises
        ) {

          formSendMessage
            .attachment
            .push(
              fs.createReadStream(
                item.pathFile
              )
            );
        }
      }
    }


    return message.reply(
      formSendMessage
    );
  }
};


/* =========================================================
 *                  FIRST FILE FEATURES
 * ========================================================= */


/* =========================================================
 *                  CATEGORY SEARCH
 * ========================================================= */

async function sendCategoryCommands(
  message,
  categoryName,
  role
) {

  const categoryGroups = {

    "AI & IMAGE": [
      "ai",
      "ai music",
      "art",
      "gpt",
      "chatgpt",
      "ai assistant",
      "assistant",
      "ai image"
    ],

    "image": [
      "image",
      "photo",
      "picture",
      "img",
      "imgs",
      "photos"
    ],

    "MEDIA & VIDEO": [
      "media",
      "video",
      "audio",
      "auido",
      "music"
    ],

    "GENERAL": [
      "general"
    ],

    "BANKING": [
      "banking",
      "bank",
      "boney"
    ],

    "FUN & GAMES": [
      "fun",
      "games",
      "game"
    ],

    "SYSTEM & UTILITY": [
      "utility",
      "tools",
      "tool",
      "system"
    ],

    "ADMIN": [
      "admin",
      "moderation",
      "owner",
      "noobs",
      "god"
    ],

    "GROUP": [
      "group",
      "thread",
      "threads",
      "box",
      "box chat",
      "chatbox",
      "boxchat"
    ]
  };


  let matchedCategory =
    categoryName;


  for (
    const [
      groupName,
      keywords
    ]
    of Object.entries(
      categoryGroups
    )
  ) {

    if (
      keywords.includes(
        categoryName
      )
    ) {

      matchedCategory =
        groupName;

      break;
    }
  }


  const categoryCommands = [];


  commands.forEach(
    (cmd, name) => {

      if (
        cmd.config.role <= role
      ) {

        const commandCategory =
          (
            cmd.config.category ||
            ""
          ).toLowerCase();


        if (
          commandCategory ===
            categoryName ||
          matchedCategory
            .toLowerCase()
            .includes(commandCategory)
        ) {

          categoryCommands.push(
            name
          );
        }
      }
    }
  );


  if (
    categoryCommands.length === 0
  ) {

    return message.reply(
      `❌ No commands found in category '${categoryName}'.`
    );
  }


  let response =
    `📜 Commands in Category: ${matchedCategory.toUpperCase()}\n`;

  response +=
    `| ❃ ${categoryCommands
      .sort()
      .join(" ❃ ")}\n`;


  return message.reply(
    response
  );
}


/* =========================================================
 *                  COMMAND SEARCH
 * ========================================================= */

async function searchCommands(
  message,
  searchWord,
  role
) {

  const matchingCommands = [];


  commands.forEach(
    (cmd, name) => {

      if (
        cmd.config.role <= role &&
        (
          name
            .toLowerCase()
            .includes(searchWord) ||

          (
            cmd.config.shortDescription &&
            String(
              typeof cmd.config.shortDescription === "object"
                ? (
                    cmd.config.shortDescription.en ||
                    ""
                  )
                : cmd.config.shortDescription
            )
              .toLowerCase()
              .includes(searchWord)
          )
        )
      ) {

        matchingCommands.push(
          name
        );
      }
    }
  );


  if (
    matchingCommands.length === 0
  ) {

    return message.reply(
      `❌ No commands found matching '${searchWord}'.`
    );
  }


  let response =
    `🔎 Commands matching '${searchWord}':\n`;

  response +=
    `| ❃ ${matchingCommands
      .sort()
      .join(" ❃ ")}\n`;


  return message.reply(
    response
  );
}


/* =========================================================
 *                  AUTHOR SEARCH
 * ========================================================= */

async function searchByAuthor(
  message,
  authorName,
  role
) {

  const authorCommands = [];


  commands.forEach(
    (cmd, name) => {

      const commandAuthor =
        cmd.config.author || "";


      if (
        cmd.config.role <= role &&
        commandAuthor
          .toLowerCase()
          .includes(
            authorName.toLowerCase()
          )
      ) {

        authorCommands.push(
          name
        );
      }
    }
  );


  if (
    authorCommands.length === 0
  ) {

    return message.reply(
      `❌ No commands found by author '${authorName}'.`
    );
  }


  let response =
    `👑 Commands by Author: ${authorName}\n`;

  response +=
    `| ❃ ${authorCommands
      .sort()
      .join(" ❃ ")}\n`;


  return message.reply(
    response
  );
}


/* =========================================================
 *                  LANGUAGE HELPER
 * ========================================================= */

function checkLangObject(
  data,
  langCode
) {

  if (
    typeof data === "string"
  ) {

    return data;
  }


  if (
    typeof data === "object" &&
    !Array.isArray(data)
  ) {

    return (
      data[langCode] ||
      data.en ||
      undefined
    );
  }


  return undefined;
}


/* =========================================================
 *                  CROP DESCRIPTION
 * ========================================================= */

function cropContent(
  content,
  max
) {

  if (
    max &&
    content.length > max
  ) {

    content =
      content.slice(
        0,
        max - 3
      ) + "...";
  }


  return content;
}


/* =========================================================
 *                  USE PREFIX
 * ========================================================= */

function usePrefixOk(
  usePrefix
) {

  return usePrefix === false
    ? "No Need!"
    : usePrefix === true
      ? "Required!"
      : "Required";
}


/* =========================================================
 *                  PREMIUM
 * ========================================================= */

function isPremiumOk(
  isPremium
) {

  return isPremium === false
    ? "Free to use"
    : isPremium === true
      ? "Yes"
      : "Free!!";
}


/* =========================================================
 *                  MONEY
 * ========================================================= */

function MoneyOk(
  requiredMoney
) {

  if (
    requiredMoney === 0 ||
    requiredMoney === false
  ) {

    return "Free!!";
  }


  if (
    requiredMoney === true
  ) {

    return "Money required";
  }


  if (
    typeof requiredMoney === "number"
  ) {

    return requiredMoney;
  }


  return 500;
}
