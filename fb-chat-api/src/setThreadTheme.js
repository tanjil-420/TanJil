"use strict";

var utils = require("../utils");
var log = require("npmlog");
// @author: ASIF

module.exports = function (defaultFuncs, api, ctx) {
    return function setThreadTheme(threadID, options, callback) {
        let resolveFunc = function () {};
        let rejectFunc = function () {};
        const returnPromise = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            if (utils.getType(options) == "Function") {
                callback = options;
                options = null;
            } else {
                callback = function (err) {
                    if (err) {
                        return rejectFunc(err);
                    }
                    resolveFunc();
                };
            }
        }
        if (!options) {
            options = {};
        }

        if (!threadID) {
            return callback({ error: "threadID is required" });
        }

        async function updateTheme() {
            try {
                const time = Date.now();
                
                let allThemes = [];
                try {
                    const formData = {
                        av: ctx.userID,
                        __aaid: 0,
                        __user: ctx.userID,
                        __a: 1,
                        __req: utils.getSignatureID(),
                        __hs: "20352.HYP:comet_pkg.2.1...0",
                        dpr: 1,
                        __ccg: "EXCELLENT",
                        __rev: "1027396270",
                        __s: utils.getSignatureID(),
                        __hsi: "7552524636527201016",
                        __comet_req: 15,
                        fb_dtsg: ctx.fb_dtsg,
                        jazoest: ctx.ttstamp,
                        lsd: ctx.fb_dtsg,
                        __spin_r: "1027396270",
                        __spin_b: "trunk",
                        __spin_t: time,
                        __crn: "comet.fbweb.MWInboxHomeRoute",
                        qpl_active_flow_ids: "25308101",
                        fb_api_caller_class: "RelayModern",
                        fb_api_req_friendly_name: "MWPThreadThemeQuery_AllThemesQuery",
                        variables: JSON.stringify({
                            "version": "default"
                        }),
                        server_timestamps: true,
                        doc_id: "24474714052117636"
                    };

                    const res = await defaultFuncs
                        .post("https://www.facebook.com/api/graphql/", ctx.jar, formData)
                        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

                    if (res && res.data && res.data.messenger_thread_themes) {
                        allThemes = res.data.messenger_thread_themes;
                    }
                } catch (e) {
                    log.warn("setThreadTheme", "Could not fetch themes");
                }

                let themeID = null;
                let emoji = "";
                
                if (typeof options === "string") {
                    if (options.match(/^[0-9]+$/)) {
                        themeID = options;
                    } else {
                        const found = allThemes.find(t => 
                            t.accessibility_label && 
                            t.accessibility_label.toLowerCase().includes(options.toLowerCase())
                        );
                        if (found) {
                            themeID = found.id;
                        } else {
                            const colors = {
                                blue: "196241301102133",
                                purple: "370940413392601", 
                                green: "169463077092846",
                                pink: "230032715012014",
                                orange: "175615189761153",
                                red: "2136751179887052",
                                yellow: "2058653964378557",
                                teal: "417639218648241",
                                black: "539927563794799",
                                white: "2873642392710980",
                                default: "196241301102133"
                            };
                            themeID = colors[options.toLowerCase()] || colors.default;
                        }
                    }
                } else if (typeof options === "object" && options !== null) {
                    themeID = options?.themeId || options?.theme_id || options.id;
                    emoji = options?.emoji || options?.customEmoji || "✨";
                }

                if (!themeID) {
                    themeID = "196241301102133";
                }

                const postForm = {
                    av: ctx.userID,
                    __aaid: 0,
                    __user: ctx.userID,
                    __a: 1,
                    __req: utils.getSignatureID(),
                    __hs: "20352.HYP:comet_pkg.2.1...0",
                    dpr: 1,
                    __ccg: "EXCELLENT",
                    __rev: "1027396270",
                    __s: utils.getSignatureID(),
                    __hsi: "7552524636527201016",
                    __comet_req: 15,
                    fb_dtsg: ctx.fb_dtsg,
                    jazoest: ctx.ttstamp,
                    lsd: ctx.fb_dtsg,
                    __spin_r: "1027396270",
                    __spin_b: "trunk",
                    __spin_t: time,
                    __crn: "comet.fbweb.MWInboxHomeRoute",
                    fb_api_caller_class: "RelayModern",
                    fb_api_req_friendly_name: "MessengerThreadThemeUpdateMutation",
                    variables: JSON.stringify({
                        "input": {
                            "actor_id": ctx.userID,
                            "client_mutation_id": Math.floor(Math.random() * 10000).toString(),
                            "source": "SETTINGS",
                            "thread_id": threadID.toString(),
                            "theme_id": themeID.toString(),
                            "custom_emoji": emoji
                        }
                    }),
                    server_timestamps: true,
                    doc_id: "9734829906576883"
                };

                const result = await defaultFuncs
                    .post("https://www.facebook.com/api/graphql/", ctx.jar, postForm)
                    .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

                if (result && result.errors && result.errors.length > 0) {
                    throw new Error("GraphQL Error: " + JSON.stringify(result.errors));
                }

                if (result && result.data && result.data.messenger_thread_theme_update) {
                    const data = result.data.messenger_thread_theme_update;
                    if (data.errors && data.errors.length > 0) {
                        throw new Error("Theme Error: " + JSON.stringify(data.errors));
                    }
                }

                return callback(null, {
                    threadID: threadID,
                    themeId: themeID,
                    customEmoji: emoji,
                    timestamp: time,
                    success: true
                });

            } catch (err) {
                log.error("setThreadTheme", err);
                return callback(err);
            }
        }

        updateTheme();
        return returnPromise;
    };
};
