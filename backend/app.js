var express = require('express');
var app = express();
var es6 = require('es6-shim');
var request = require('request');
var Q = require('q');

var util = require('util');


app.get('/', function(req, res) {
    res.send('hello world');
});

var PORT = 3000;

var config = require('config.json');

var fbConfig = config["fbgroup"];
console.log(fbConfig);


var tokenCache = new Map();

var fetchTokenCbBySource = {};

fetchTokenCbBySource["fbgroup"] = function() {
    var deferred = Q.defer();
    request(getTokenUrl(fbConfig), function(err, res, body) {
        token = extractTokenFromResponse(body);
        tokenCache.set(token);
        deferred.resolve(token);
    });
    return deferred.promise;
}


var getFbgroupFeed = function(token, groupId) {
    var endpoint = util.format('https://graph.facebook.com/%s/feed?access_token=%s', groupId,token);
    console.log(endpoint);
    return request(endpoint);
};
//give promises


var services = {};

var getTokenUrl = function(configByFbgroup) {
    return util.format('https://graph.facebook.com/oauth/access_token?client_id=%s&client_secret=%s&grant_type=client_credentials', configByFbgroup.app_id, configByFbgroup.app_secret);
}

var extractTokenFromResponse = function(res) {
    return res.split('=')[1];
};


// console.log(promise);
// var getUrl 

//return promise in obth cases
var getToken = function(socialSource) {
    if (!tokenCache.has(socialSource)) {
        return fetchTokenCbBySource[socialSource]();
    } else {
        return Q.fcall(function() {
            return tokenCache.get(socialSource);
        });
    }
}



app.get('/fbgroup', function(req, res) {

    getToken('fbgroup').then(function(token) {
        getFbgroupFeed(token, 614373621963841).pipe(res);
    })

});


app.listen(PORT);