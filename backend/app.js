var PORT = 18503;
var express = require('express');
var app = express();
var es6 = require('es6-shim');
var request = require('request');
var Q = require('q');
var util = require('util');
var _ = require('underscore');
var config = require('./config.json');
var qs = require('querystring');

var twitterService = require('./services/twitter.js')(config["twitter_user"]);
var facebookService = require('./services/facebook.js')(config["fbgroup"]);

app.get('/', function(req, res) {
    res.send('hello world');
});

console.log(twitterService);

var _services = {
    'twitter_user': twitterService,
    'fbgroup': facebookService
}

// twitter
// token
// 2224226316-B0bnf2lOR5rkurldsV2la8QWKRIr4tqaBTcBSaC
// secret
// WG1SIa35Vabip6z32eSRUZupvSbcfPknAdl2wDUzyBc9m


var tokenCache = new Map();

var fetchTokenCbBySource = {};


var fetchTokenCbBySource = function(source) {
    var deferred = Q.defer();
    request(_services[source].getTokenUrl(config[source]), function(err, res, body) {
        token = _services[source].getTokenCallback(body);
        tokenCache.set(token);
        deferred.resolve(token);
    });
    return deferred.promise;
}

// "keywords":["新界東北","政總","立法會"],
var getFbSearchFeed = function(token, keywords) {
    console.log('started');
    console.log(keywords);
    // keywords = keywords.map(function(keyword) {
    //     return _.escape(keyword);
    // }).join('%2C');
    keywords = qs.escape(keywords);
    // keywords = qs.escape(keywords.join(","));

    var endpoint = util.format('https://graph.facebook.com/search?access_token=%s&q=%s&limit=20', token, keywords);
    console.log(endpoint);
    return request.bind(this, endpoint);

    //   graph.facebook.com
    // /search?
    //   q={your-query}&
    //   [type={object-type}](#searchtypes)
};
// %23
// type=location&
//     center=37.76,-122.427&
//     distance=1000

var getFbgroupFeed = function(token, groupId) {
    var endpoint = util.format('https://graph.facebook.com/%s/feed?access_token=%s&limit=20', groupId, token);
    return request.bind(this, endpoint);
};
//give promises


var services = {};


// console.log(promise);
// var getUrl x

//return promise in obth cases
var getToken = function(socialSource) {
    if (!tokenCache.has(socialSource)) {
        return fetchTokenCbBySource(socialSource);
    } else {
        return Q.fcall(function() {
            return tokenCache.get(socialSource);
        });
    }
}

// function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body) // Print the google web page.
//   }
// }
function _redirectbody(res, isJsonp, error, response, body) {
    if (!error && response.statusCode == 200) {
        if (isJsonp) {
            res.jsonp(200, body);
        } else {
            res.send(200, body);
        }
    }
};

app.get('/fbgroup', function(req, res) {
    getToken('fbgroup').then(function(token) {
        getFbgroupFeed(token, 614373621963841)(_redirectbody.bind(this,res, req.query.jsonp));

    })

});

app.get('/fbsearch', function(req, res) {
    getToken('fbgroup').then(function(token) {
        console.log(config["fbsearch"]);
        console.log(req.query);
        getFbSearchFeed(token, req.query.keywords)(_redirectbody.bind(this,res, req.query.jsonp));
    })

});

app.get('/twitter', function(req, res) {
    twitterService.search().then(function(data) {
        res.jsonp(data);
    });

});


app.listen(PORT);