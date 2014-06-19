"use strict";
// https://dev.twitter.com/docs/auth/oauth/faq
// do not currently expire access tokens
// access token will be invalid if a user explicitly rejects your application from their settings or if a Twitter admin suspends your application. If your application is suspended there will be a note on your application page saying that it has been suspended.

var Q = require("q");

module.exports = function(config) {
    console.log(config);
    var twitterAPI = require('node-twitter-api');

    var twitter = new twitterAPI({
        consumerKey: config.consumer_key,
        consumerSecret: config.consumer_secret,
        callback: config.callback
    });


    var _service = {};
    // https://dev.twitter.com/docs/api/1.1/get/search/tweets

    _service.search = function() {

        var _deferred = Q.defer();

        twitter.search({
                // q:"code4hk, worldcupProbs",
                q: config.users.join(" , "),
                count: 20
            }, config.access_token, config.access_token_secret,
            function(err, res) {
                if(!err){
                    _deferred.resolve(res);
                }else{
                    _deferred.reject(new Error(err));
                }
            })
        return _deferred.promise;
        
        };

    return _service;

}