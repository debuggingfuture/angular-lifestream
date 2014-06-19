var PORT = 18503;
var express = require('express');
var app = express();
var es6 = require('es6-shim');
var request = require('request');
var Q = require('q');
var util = require('util');
var config = require('./config.json');

var twitterService = require('./services/twitter.js')(config["twitter_user"]);

app.get('/', function(req, res) {
    res.send('hello world');
});

console.log(twitterService);

var fbConfig = config["fbgroup"];


// twitter
// token
// 2224226316-B0bnf2lOR5rkurldsV2la8QWKRIr4tqaBTcBSaC
// secret
// WG1SIa35Vabip6z32eSRUZupvSbcfPknAdl2wDUzyBc9m


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

app.get('/twitter', function(req, res) {
    twitterService.search().then(function(data) {
        res.send(data);
});

});


app.listen(PORT);