"use strict";
// @ChoruOfficial
const log = require("npmlog");
const cheerio = require("cheerio");
const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const FormData = require("form-data");
const _ = require('lodash');
const deepdash = require('deepdash');
deepdash(_);

// ==================== NETWORK UTILITIES ====================
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
let proxyConfig = {};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function adaptResponse(res) {
    const response = res.response || res;
    return {
        ...response,
        body: response.data,
        statusCode: response.status,
        request: {
            uri: new URL(response.config.url),
            headers: response.config.headers,
            method: response.config.method.toUpperCase(),
            form: response.config.data
        },
    };
}

async function requestWithRetry(requestFunction, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await requestFunction();
            return adaptResponse(res);
        } catch (error) {
            if (i === retries - 1) {
                if (error.response) return adaptResponse(error.response);
                throw error;
            }
            await delay(Math.pow(2, i) * 1000);
        }
    }
}

function setProxy(proxyUrl) {
    if (proxyUrl) {
        try {
            const parsedProxy = new URL(proxyUrl);
            proxyConfig = {
                proxy: {
                    host: parsedProxy.hostname,
                    port: parsedProxy.port,
                    protocol: parsedProxy.protocol.replace(":", ""),
                    auth: parsedProxy.username && parsedProxy.password ? {
                        username: parsedProxy.username,
                        password: parsedProxy.password,
                    } : undefined,
                },
            };
        } catch {
            proxyConfig = {};
        }
    } else {
        proxyConfig = {};
    }
}

// ==================== HEADERS UTILITIES ====================
function randomUserAgent() {
    const chromeVersion = Math.floor(Math.random() * 20) + 120;
    const platform = Math.random() > 0.5 ? 'Windows' : 'macOS';
    const platformVersion = platform === 'Windows' ? '15.0.0' : '13.5.0';
    const ua = `Mozilla/5.0 (${platform === 'Windows' ? 'Windows NT 10.0; Win64; x64' : 'Macintosh; Intel Mac OS X 10_15_7'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`;
    
    return {
        userAgent: ua,
        secChUa: `"Chromium";v="${chromeVersion}", "Not(A:Brand";v="24", "Google Chrome";v="${chromeVersion}"`,
        secChUaFullVersionList: `"Chromium";v="${chromeVersion}", "Not(A:Brand";v="24", "Google Chrome";v="${chromeVersion}"`,
        secChUaPlatform: `"${platform}"`,
        secChUaPlatformVersion: `"${platformVersion}"`,
        secChUaMobile: '?0',
        secChUaModel: '""'
    };
}

function getHeaders(url, options, ctx, customHeader) {
    const { userAgent, secChUa, secChUaFullVersionList, secChUaPlatform, secChUaPlatformVersion } = randomUserAgent();
    const host = new URL(url).hostname;
    const referer = `https://${host}/`;

    const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Dpr': '1',
        'Host': host,
        'Origin': `https://${host}`,
        'Referer': referer,
        'Sec-Ch-Prefers-Color-Scheme': 'light',
        'Sec-Ch-Ua': secChUa,
        'Sec-Ch-Ua-Full-Version-List': secChUaFullVersionList,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Model': '""',
        'Sec-Ch-Ua-Platform': secChUaPlatform,
        'Sec-Ch-Ua-Platform-Version': secChUaPlatformVersion,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': userAgent,
        'Viewport-Width': '1920'
    };

    if (ctx) {
        if (ctx.fb_dtsg) headers['X-Fb-Lsd'] = ctx.lsd;
        if (ctx.region) headers['X-MSGR-Region'] = ctx.region;
        if (ctx.master) {
            const { __spin_r, __spin_b, __spin_t } = ctx.master;
            if (__spin_r) headers['X-Fb-Spin-R'] = String(__spin_r);
            if (__spin_b) headers['X-Fb-Spin-B'] = String(__spin_b);
            if (__spin_t) headers['X-Fb-Spin-T'] = String(__spin_t);
        }
    }
    
    if (customHeader) {
        Object.assign(headers, customHeader);
        if (customHeader.noRef) delete headers.Referer;
    }

    return headers;
}

// ==================== NETWORK METHODS ====================
async function networkGet(url, reqJar, qs, options, ctx, customHeader) {
    const config = {
        headers: getHeaders(url, options, ctx, customHeader),
        timeout: 60000,
        params: qs,
        ...proxyConfig,
        validateStatus: (status) => status >= 200 && status < 600,
    };
    return requestWithRetry(async () => await client.get(url, config));
}

async function networkPost(url, reqJar, form, options, ctx, customHeader) {
    const headers = getHeaders(url, options, ctx, customHeader);
    let data = form;
    let contentType = headers['Content-Type'] || 'application/x-www-form-urlencoded';

    if (contentType.includes('json')) {
        data = JSON.stringify(form);
    } else {
        const transformedForm = new URLSearchParams();
        for (const key in form) {
            if (form.hasOwnProperty(key)) {
                let value = form[key];
                if (typeof value === "object") value = JSON.stringify(value);
                transformedForm.append(key, value);
            }
        }
        data = transformedForm.toString();
    }
    
    headers['Content-Type'] = contentType;

    const config = {
        headers,
        timeout: 60000,
        ...proxyConfig,
        validateStatus: (status) => status >= 200 && status < 600,
    };
    return requestWithRetry(async () => await client.post(url, data, config));
}

// ==================== JSON PARSING UTILITIES ====================
async function json(url, jar, qs, options, ctx, customHeader) {
    try {
        const res = await networkGet(url, jar, qs, options, ctx, customHeader);
        const body = res.body;
        const $ = cheerio.load(body);
        const scripts = $('script[type="application/json"]');

        if (scripts.length === 0) {
            log.warn(`No <script type="application/json"> tags found on ${url}`);
            return [];
        }

        const allJsonData = [];
        scripts.each((index, element) => {
            try {
                const jsonContent = $(element).html();
                if (jsonContent) allJsonData.push(JSON.parse(jsonContent));
            } catch (e) {
                log.warn(`Could not parse JSON from script #${index + 1} on ${url}`);
            }
        });

        return allJsonData;
    } catch (error) {
        log.error(`Error in utils.json fetching from ${url}:`, error);
        throw error;
    }
}

// ==================== DATA EXTRACTION UTILITIES ====================
function findMainUserObject(data, userID) {
    let mainUserObject = null;
    if (!Array.isArray(data)) return null;
    function deepFind(obj) {
        if (mainUserObject || typeof obj !== 'object' || obj === null) return;
        if (obj.id === userID && obj.__typename === 'User' && obj.profile_tabs) {
            mainUserObject = obj;
            return;
        }
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) deepFind(obj[k]);
        }
    }
    deepFind({ all: data });
    return mainUserObject;
}

function findSocialContextText(socialContext, keyword) {
    if (socialContext && Array.isArray(socialContext.content)) {
        for (const item of socialContext.content) {
            const text = item?.text?.text;
            if (text && text.toLowerCase().includes(keyword.toLowerCase())) return text;
        }
    }
    return null;
}

function findFirstValueByKey(dataArray, key) {
    if (!Array.isArray(dataArray)) return null;
    let found = null;
    function deepSearch(obj) {
        if (found !== null || typeof obj !== 'object' || obj === null) return;
        if (obj.hasOwnProperty(key)) {
            found = obj[key];
            return;
        }
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) deepSearch(obj[k]);
        }
    }
    for (const obj of dataArray) deepSearch(obj);
    return found;
}

function findBioFromProfileTiles(allJsonData) {
    try {
        const bio = findFirstValueByKey(allJsonData, 'profile_status_text');
        return bio?.text || null;
    } catch {
        return null;
    }
}

function findLiveCityFromProfileTiles(allJsonData) {
    try {
        const result = _.findDeep(allJsonData, (value, key, parent) => {
            return key === 'text' &&
                typeof value === 'string' &&
                value.includes('Lives in') &&
                parent?.ranges?.[0]?.entity?.category_type === "CITY_WITH_ID";
        });
        return result ? result.value : null;
    } catch {
        return null;
    }
}

// ==================== MAIN FUNCTION ====================
module.exports = (defaultFuncs, api, ctx) => {
    function createDefaultUser(id) {
        return {
            id,
            name: "Facebook User",
            firstName: "Facebook",
            lastName: null,
            vanity: id,
            profilePicUrl: `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            profileUrl: `https://www.facebook.com/profile.php?id=${id}`,
            gender: "no specific gender",
            type: "user",
            isFriend: false,
            isBirthday: false
        };
    }

    const parseAndCheckLogin = require("../../utils/client").parseAndCheckLogin;

    return function getUserInfo3(id, usePayload, callback, groupFields = []) {
        let resolveFunc = () => {};
        let rejectFunc = () => {};
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (typeof usePayload === 'function') {
            callback = usePayload;
            usePayload = true;
        }
        if (usePayload === undefined) usePayload = true;
        if (!callback) {
            callback = (err, data) => {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }

        const originalIdIsArray = Array.isArray(id);
        const ids = originalIdIsArray ? id : [id];

        if (usePayload) {
            // ============ PAYLOAD METHOD ============
            const form = {};
            ids.forEach((v, i) => { form[`ids[${i}]`] = v; });
            const getGenderString = (code) => code === 1 ? "male" : code === 2 ? "female" : "no specific gender";
            
            defaultFuncs.post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
                .then(resData => parseAndCheckLogin(ctx, defaultFuncs)(resData))
                .then(resData => {
                    if (resData?.error && resData?.error !== 3252001) throw resData;
                    const retObj = {};
                    const profiles = resData?.payload?.profiles;
                    if (profiles) {
                        for (const prop in profiles) {
                            if (profiles.hasOwnProperty(prop)) {
                                const inner = profiles[prop];
                                const nameParts = inner.name ? inner.name.split(' ') : [];
                                retObj[prop] = {
                                    id: prop,
                                    name: inner.name,
                                    firstName: inner.firstName,
                                    lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : null,
                                    vanity: inner.vanity,
                                    profilePicUrl: `https://graph.facebook.com/${prop}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
                                    profileUrl: inner.uri,
                                    gender: getGenderString(inner.gender),
                                    type: inner.type,
                                    isFriend: inner.is_friend,
                                    isBirthday: !!inner.is_birthday,
                                    searchTokens: inner.searchTokens,
                                    alternateName: inner.alternateName
                                };
                            }
                        }
                    } else {
                        for (const prop of ids) {
                            retObj[prop] = createDefaultUser(prop);
                        }
                    }
                    return originalIdIsArray ? callback(null, Object.values(retObj)) : callback(null, retObj[ids[0]]);
                }).catch(err => {
                    log.error("getUserInfo (payload)", err);
                    return callback(err);
                });
        } else {
            // ============ SCRAPE METHOD ============
            const fetchProfile = async (userID) => {
                try {
                    const url = `https://www.facebook.com/${userID}`;
                    const allJsonData = await json(url, ctx.jar, null, ctx.globalOptions, ctx);
                    if (!allJsonData || allJsonData.length === 0) throw new Error(`Could not find JSON data for ID: ${userID}`);
                    
                    const mainUserObject = findMainUserObject(allJsonData, userID);
                    if (!mainUserObject) throw new Error(`Could not isolate main user object for ID: ${userID}`);
                    
                    const get = (obj, path) => {
                        if (!obj || !path) return null;
                        return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
                    };
                    
                    const name = mainUserObject.name;
                    const nameParts = name ? name.split(' ') : [];
                    
                    const result = {
                        id: mainUserObject.id,
                        name: name,
                        firstName: nameParts[0] || get(mainUserObject, 'short_name') || get(findFirstValueByKey(allJsonData, 'profile_owner'), 'short_name'),
                        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : null,
                        vanity: get(mainUserObject, 'vanity') || get(findFirstValueByKey(allJsonData, 'props'), 'userVanity') || null,
                        profileUrl: mainUserObject.url,
                        profilePicUrl: `https://graph.facebook.com/${userID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
                        gender: mainUserObject.gender,
                        type: mainUserObject.__typename,
                        isFriend: mainUserObject.is_viewer_friend,
                        isBirthday: !!mainUserObject.is_birthday,
                        isVerified: !!mainUserObject.show_verified_badge_on_profile,
                        bio: findBioFromProfileTiles(allJsonData) || get(findFirstValueByKey(allJsonData, 'delegate_page'), 'best_description.text'),
                        live_city: findLiveCityFromProfileTiles(allJsonData),
                        headline: get(mainUserObject, 'contextual_headline.text') || get(findFirstValueByKey(allJsonData, 'meta_verified_section'), 'headline'),
                        followers: findSocialContextText(mainUserObject.profile_social_context, "followers"),
                        following: findSocialContextText(mainUserObject.profile_social_context, "following"),
                        coverPhoto: get(mainUserObject, 'cover_photo.photo.image.uri')
                    };
                    return result;
                } catch (err) {
                    log.error(`Failed to fetch profile for ${userID}: ${err.message}`, err);
                    return createDefaultUser(userID);
                }
            };

            Promise.all(ids.map(fetchProfile))
                .then(results => {
                    return originalIdIsArray ? callback(null, results) : callback(null, results[0] || null);
                })
                .catch(err => {
                    log.error("getUserInfo (fetch)", err);
                    callback(err);
                });
        }
        return returnPromise;
    };
};