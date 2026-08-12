"use strict";

var utils = require('../utils');
var log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function getCover(userID, callback) {
    var cb;
    var rtPromise = new Promise(function (resolve, reject) {
      cb = (err, res) => res ? resolve(res) : reject(err);
    });

    if (typeof callback == 'function') cb = callback;

    var form = {
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'ProfileCometLegacyAlbumGridViewPaginationQuery',
      variables: JSON.stringify({
        count: 14,
        scale: 1,
        id: userID
      }),
      server_timestamps: true,
      doc_id: '9790988340981785'
    };

    defaultFuncs
      .post('https://www.facebook.com/api/graphql/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (res) {
        var coverUrl = null;

        try {
          if (res.data && res.data.node) {
            var node = res.data.node;
            
            if (node.cover_photo && node.cover_photo.photo) {
              coverUrl = node.cover_photo.photo.image ? 
                node.cover_photo.photo.image.uri : 
                node.cover_photo.photo.uri;
            }
            
            if (!coverUrl && node.profileCoverPhoto) {
              coverUrl = node.profileCoverPhoto.uri;
            }
            
            if (!coverUrl && node.cover_photo_url) {
              coverUrl = node.cover_photo_url;
            }

            if (!coverUrl && node.media && node.media.edges) {
              for (var i = 0; i < node.media.edges.length; i++) {
                var edge = node.media.edges[i];
                if (edge.node && edge.node.image) {
                  coverUrl = edge.node.image.uri;
                  break;
                }
              }
            }
          }
        } catch (e) {
          log.warn('getCover', 'Error parsing GraphQL response: ' + e.message);
        }

        if (coverUrl) {
          return cb(null, {
            userID: userID,
            url: coverUrl.replace(/\\\//g, '/')
          });
        }

        return api.getUserInfo(userID, function(err, info) {
          if (err || !info || !info[userID]) {
            return cb(null, {
              userID: userID,
              url: null,
              error: "No cover photo found"
            });
          }

          var userData = info[userID];
          return cb(null, {
            userID: userID,
            url: null,
            thumbSrc: userData.thumbSrc || null,
            name: userData.name || null,
            error: "Cover photo not available"
          });
        });
      })
      .catch(function (err) {
        log.error('getCover', err);
        return cb(err);
      });

    return rtPromise;
  }
}
