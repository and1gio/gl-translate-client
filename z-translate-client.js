var ZApiRequestHelper = require("z-api-request-helper");

var ZTranslateClient = function (config) {
    var me = this;
    me.config = config;
    me.api = new ZApiRequestHelper(me.config);
};

var zTranslateClient = ZTranslateClient.prototype;
zTranslateClient.isReady = false;
zTranslateClient.languageStore = null;

zTranslateClient.helper = function (method, requestData, cb) {
    var me = this;
    me.api.post(method, requestData, function (err, res) {
        cb(err, res);
    });
};

zTranslateClient.load = function (cb) {
    var me = this;
    if (me.config.languages) {
        me.api.post("translateEntry/find/all", {}, function (err, res) {
            if (err) {
                return cb(err, null);
            } else {
                return loadHandler(res, cb);
            }
        });
    }
};

var loadHandler = function (res, cb) {
    var languages = {};
    if (res) {
        var ln = res.data.length;
        for (var i = 0; i < ln; i++) {
            languages[res.data[i].keyword] = res.data[i].translations;
        }

        zTranslateClient.languageStore = languages;
        zTranslateClient.isReady = true;

        cb(null, res);
    } else {
        cb([{keyword: "DATA_IS_EMPTY"}], null)
    }
};

zTranslateClient.get = function (language, keyword) {
    if (!zTranslateClient.isReady || !zTranslateClient.languageStore) {
        return "TRANSLATE_DATA_NOT_READY";
    }

    if (!zTranslateClient.languageStore[keyword]) {
        return keyword + "__TRANSLATE_NOT_FOUND";
    }

    if (!zTranslateClient.languageStore[keyword][language]) {
        return "TRANSLATE_LANGUAGE_NOT_FOUND";
    }
    return zTranslateClient.languageStore[keyword][language];
};

module.exports = ZTranslateClient;