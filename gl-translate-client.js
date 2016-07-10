var HRH = require("msda-http-request-helper");
var clientErrorStore = require("gl-clients-error-codes");

var MSDATranslateClient = function (config) {
    var me = this;
    me.config = config;
    me.hrh = new HRH(me.config);
};

var translateClient = MSDATranslateClient.prototype;
translateClient.isReady = false;
translateClient.languageStore = null;

translateClient.helper = function (method, requestData, cb) {
    var me = this;
    me.hrh.request(method, requestData, function (err, res) {
        cb(err, res);
    });
};

translateClient.load = function (cb) {
    var me = this;
    if (me.config.languages) {
        me.hrh.request("translateEntry/find/all", {}, function (err, res) {
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

        translateClient.languageStore = languages;
        translateClient.isReady = true;

        cb(null, res);
    } else {
        var err = clientErrorStore("dataIsEmpty", null);
        cb(err, null)
    }
};

translateClient.get = function (language, keyword) {
    if (!translateClient.isReady || !translateClient.languageStore) {
        return "LANGUAGE_CLIENT_DATA_NOT_READY";
    }

    if (!translateClient.languageStore[keyword]) {
        return "LANGUAGE_CLIENT_KEYWORD_NOT_FOUND";
    }

    if (!translateClient.languageStore[keyword][language]) {
        return "LANGUAGE_CLIENT_LANGUAGE_NOT_FOUND_IN_KEYWORD";
    }
    return translateClient.languageStore[keyword][language];
};

module.exports = MSDATranslateClient;