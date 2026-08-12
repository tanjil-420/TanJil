"use strict";

const log = require("npmlog");

module.exports = function () {
  function handleAvatar(userIDs, height, width) {
    try {
      if (!Array.isArray(userIDs)) userIDs = [userIDs];

      const result = {};
      userIDs.forEach((uid) => {
        result[uid] = `https://graph.facebook.com/${uid}/picture?width=${width}&height=${height}&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      });

      // Always return string for single UID
      if (userIDs.length === 1) return Promise.resolve(result[userIDs[0]]);
      return Promise.resolve(result);
    } catch (err) {
      log.error("getAvatarUser", err.message);
      return Promise.reject(err);
    }
  }

  return async function getAvatarUser(userIDs, size = [512, 512], callback) {
    if (!userIDs) throw new Error("No userID provided");

    if (typeof size === "function") {
      callback = size;
      size = [512, 512];
    } else if (typeof size === "number" || typeof size === "string") {
      size = [size, size];
    } else if (Array.isArray(size) && size.length === 1) {
      size = [size[0], size[0]];
    }

    const [height, width] = size;

    try {
      const res = await handleAvatar(userIDs, height, width);

      if (typeof callback === "function") callback(null, res);
      return res;
    } catch (err) {
      if (typeof callback === "function") callback(err, null);
      throw err;
    }
  };
};