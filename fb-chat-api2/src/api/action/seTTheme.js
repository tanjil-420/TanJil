"use strict";

const { parseAndCheckLogin } = require("../../utils/client");
const { generateOfflineThreadingID } = require("../../utils/format");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {

  return function setTTheme(themeName, threadID, callback) {
  let resolveFunc = function () {};
  let rejectFunc = function () {};
  const returnPromise = new Promise(function (resolve, reject) {
  resolveFunc = resolve;
  rejectFunc = reject;
  });

if (!callback) {
  callback = function (err, data) {
    if (err) return rejectFunc(err);
    resolveFunc(data);
  };
}

if (!threadID) {
  return callback({ error: "threadID is required to change theme." });
}

if (!themeName) {
  return callback({ error: "themeName (or 'list') is required." });
}

if (!ctx.mqttClient || !ctx.mqttClient.connected) {
  return callback({ 
    error: "MQTT not connected. Theme changes require MQTT connection. Make sure bot is fully started with listenMqtt active." 
  });
}

function fetchAllThemes(cb) {
  log.info("setTTheme", "Fetching available themes from Facebook...");
  
  const form = {
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "MWPThreadThemeQuery_AllThemesQuery",
    variables: JSON.stringify({ version: "default" }),
    server_timestamps: true,
    doc_id: "24474714052117636"
  };

  defaultFuncs
    .post("https://www.facebook.com/api/graphql/", ctx.jar, form, null, {
      "x-fb-friendly-name": "MWPThreadThemeQuery_AllThemesQuery",
      "x-fb-lsd": ctx.lsd || ctx.fb_dtsg,
      "referer": "https://www.facebook.com/messages/t/" + threadID
    })
    .then(parseAndCheckLogin(ctx, defaultFuncs))
    .then(function (resData) {
      if (resData.errors) {
        return cb({ error: "GraphQL error: " + JSON.stringify(resData.errors) });
      }

      if (!resData.data || !resData.data.messenger_thread_themes) {
        return cb({ error: "Could not retrieve themes from Facebook." });
      }

      const themes = resData.data.messenger_thread_themes
        .map(function (themeData) {
          if (!themeData || !themeData.id) return null;

          return {
            id: themeData.id,
            name: themeData.accessibility_label,
            description: themeData.description,
            appColorMode: themeData.app_color_mode,
            fallbackColor: themeData.fallback_color,
            gradientColors: themeData.gradient_colors,
            backgroundImage: themeData.background_asset?.image?.uri,
            iconAsset: themeData.icon_asset?.image?.uri,
            composerBackgroundColor: themeData.composer_background_color,
            composerTintColor: themeData.composer_tint_color,
            titleBarBackgroundColor: themeData.title_bar_background_color,
            titleBarTextColor: themeData.title_bar_text_color,
            hotLikeColor: themeData.hot_like_color,
            inboundMessageGradientColors: themeData.inbound_message_gradient_colors,
            messageTextColor: themeData.message_text_color
          };
        })
        .filter(Boolean);

      log.info("setTTheme", "Successfully fetched " + themes.length + " themes");
      cb(null, themes);
    })
    .catch(function (err) {
      log.error("setTTheme", "Failed to fetch themes:", err);
      cb({ error: "Failed to fetch theme list: " + (err.message || err) });
    });
}

function setThemeViaMqtt(themeID, actualThemeName, cb) {
  log.info("setTTheme", "Setting theme '" + actualThemeName + "' (ID: " + themeID + ") for thread " + threadID);

  let currentEpochId = parseInt(generateOfflineThreadingID());
  let publishedCount = 0;
  const errors = [];

  function createAndPublish(label, queueName, payload, done) {
    currentEpochId = parseInt(generateOfflineThreadingID());
    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const requestId = ctx.wsReqNumber;

    const queryPayload = {
      thread_key: threadID.toString(),
      theme_fbid: themeID.toString(),
      sync_group: 1
    };

    Object.keys(payload).forEach(function(key) {
      queryPayload[key] = payload[key];
    });

    const query = {
      failure_count: null,
      label: label,
      payload: JSON.stringify(queryPayload),
      queue_name: queueName,
      task_id: ctx.wsTaskNumber
    };

    const context = {
      app_id: ctx.appID || "2220391788200892",
      payload: {
        epoch_id: currentEpochId,
        tasks: [query],
        version_id: "24631415369801570"
      },
      request_id: requestId,
      type: 3
    };

    context.payload = JSON.stringify(context.payload);

    log.info("setTTheme", "Publishing MQTT message: label=" + label + ", queueName=" + queueName);

    ctx.mqttClient.publish("/ls_req", JSON.stringify(context), { qos: 1, retain: false }, function (err) {
      if (err) {
        log.error("setTTheme", "MQTT publish failed for " + queueName + ":", err);
        errors.push("Failed to publish " + queueName + ": " + err.message);
      } else {
        publishedCount++;
        log.info("setTTheme", "Successfully published " + queueName);
      }
      done();
    });
  }

  let pending = 4;
  function checkComplete() {
    pending--;
    if (pending === 0) {
      if (errors.length > 0) {
        return cb({ error: "Some MQTT publishes failed: " + errors.join(", ") });
      }

      const eventData = {
        type: "thread_theme_update",
        threadID: threadID,
        themeID: themeID,
        themeName: actualThemeName,
        senderID: ctx.userID,
        timestamp: Date.now()
      };

      log.info("setTTheme", "✅ Theme changed successfully!");
      cb(null, eventData);
    }
  }

  createAndPublish("1013", "ai_generated_theme", {}, checkComplete);
  createAndPublish("1037", "msgr_custom_thread_theme", {}, checkComplete);
  createAndPublish("1028", "thread_theme_writer", {}, checkComplete);
  createAndPublish("43", "thread_theme", { source: null, payload: null }, checkComplete);
}

fetchAllThemes(function (err, themes) {
  if (err) {
    return callback(err);
  }

  if (themeName.toLowerCase() === "list") {
    log.info("setTTheme", "Returning list of " + themes.length + " available themes");
    return callback(null, themes);
  }

  const normalizedThemeName = themeName.toLowerCase();
  let matchedTheme = null;

  if (!isNaN(normalizedThemeName)) {
    matchedTheme = themes.find(function (t) {
      return t.id === normalizedThemeName;
    });
  }

  if (!matchedTheme) {
    matchedTheme = themes.find(function (t) {
      return t.name.toLowerCase() === normalizedThemeName;
    });
  }

  if (!matchedTheme) {
    matchedTheme = themes.find(function (t) {
      return t.name.toLowerCase().includes(normalizedThemeName);
    });
  }

  if (!matchedTheme) {
    log.warn("setTTheme", "Theme '" + themeName + "' not found");
    return callback({
      error: "Theme \"" + themeName + "\" not found. Use api.setTTheme('list', threadID) to see available themes."
    });
  }

  setThemeViaMqtt(matchedTheme.id, matchedTheme.name, callback);
});

return returnPromise;

}
}