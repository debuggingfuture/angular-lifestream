define(['services/abstract'], function(abstractServiceFeed) {

    // var ServiceFeed = function(service, config) {
    //     abstractServiceFeed.call(this, service, config);

    // };
    // ServiceFeed.prototype = Object.create(abstractServiceFeed.prototype);
    // ServiceFeed.constructor = ServiceFeed;
    var ServiceFeed= abstractServiceFeed.factory();

    var charEscapedByService = [{
        "escaped": "&#39;",
        "unescaped": "\'"
    }],
        twitterSize = ['thumb', 'large'],
        parseMediaUrl = function(status) {
            if ((status.user.entities || {}).media) {
                return status.user.entities.media.replace(/https*:(.*):(.*)$/, '$1');
            }
        },

        /**
         * Add links to the twitter feed.
         * Hashes, @ and regular links are supported.
         * @private
         * @param {String} tweet A string of a tweet
         * @return {String} A linkified tweet
         */
        linkify = function(tweet) {

            var escapeChar = function(t) {
                angular.forEach(charEscapedByService, function(charToEscape) {
                    t = t.replace(new RegExp(charToEscape.escaped, "g"), charToEscape.unescaped);
                })
                return t;
            };


            var link = function(t) {
                return t.replace(
                    /[a-z]+:\/\/[a-z0-9\-_]+\.[a-z0-9\-_:~%&\?\/.=]+[^:\.,\)\s*$]/ig,
                    function(m) {
                        return '<a href="' + m + '">' +
                            ((m.length > 25) ? m.substr(0, 24) + '...' : m) +
                            '</a>';
                    }
                );
            },
                at = function(t) {
                    return t.replace(
                        /(^|[^\w]+)\@([a-zA-Z0-9_]{1,15})/g,
                        function(m, m1, m2) {
                            return m1 + '<a href="http://twitter.com/' + m2 + '">@' +
                                m2 + '</a>';
                        }
                    );
                },
                hash = function(t) {
                    return t.replace(
                        /(^|[^\w'"]+)\#([a-zA-Z0-9ÅåÄäÖöØøÆæÉéÈèÜüÊêÛûÎî_]+)/g,
                        function(m, m1, m2) {
                            return m1 + '<a href="http://www.twitter.com/search?q=%23' +
                                m2 + '">#' + m2 + '</a>';
                        }
                    );
                };

            return hash(at(link(escapeChar(tweet))));

        };



    ServiceFeed.prototype.getYqlUrl = function() {

        var tableUrl = 'https://raw.github.com/vincentlaucy/twitter-open-data-table/master/table.xml';
        return 'USE "' + tableUrl +
            '" AS twitter; SELECT * FROM twitter WHERE screen_name = "' +
            this._config.user + '"';
    };

    /**
     * Parse the input from twitter
     * @private
     * @param  {Object[]} items
     * @return {Object[]} Array of Twitter status messages.
     */
    ServiceFeed.prototype.parse = function(query) {
        var items = query.results.items;
        var output = [],
            i = 0,
            j = items.length;

        for (i; i < j; i++) {
            var status = items[i];
            output.push({
                "date": new Date(status.created_at * 1000), // unix time
                "config": this._config,
                "context": {
                    "publisher": {
                        "name": status.user.name,
                        "screen_name": status.user.screen_name,
                    },
                    "tweet": linkify(status.text),
                    "media": parseMediaUrl(status),
                    "complete_url": 'http://twitter.com/' + this._config.user +
                        "/status/" + status.id_str
                },
                "url": 'http://twitter.com/' + this._config.user
            });
        }
        return output;
    };



    return ServiceFeed;
});
