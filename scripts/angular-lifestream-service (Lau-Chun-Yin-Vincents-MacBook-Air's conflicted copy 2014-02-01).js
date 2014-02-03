define(
    ["angular"], function(angular) {
        //each feed as a ind services?
        var angularLifestreamServiceFactory = function($http, $q) {


            var _service = {};
            //TODO another fx scope better than namespace?
            _service.settings = {},
            _service.itemsettings = angular.copy(_service.settings);


            _service.feeds = _service.feeds || {};

            _service.init = function(config) {
                _service.settings = config || {};
                _service.itemsettings = _service.settings;
                //TODO extend

            };

            _service.sortItems = function(items) {
                //TODO allow override
                //e.g. heuristic fx that prefers fb over twitter
                // Sort the feeditems by date - we want the most recent one first
                items = items.sort(function(a, b) {
                    return (b.date - a.date);
                });
                return items;
            };

            /**
             * This method will be called every time a feed is loaded. This means
             * that several DOM changes will occur. We did this because otherwise it
             * takes to look before anything shows up.
             * We allow 1 request per feed - so 1 DOM change per feed
             * @private
             * @param {Array} newItems an array containing all the feeditems for a
             * specific feed.
             */
            _service.finished = function(originalItems, newItems) {

                // Merge the feed items we have from other feeds, with the feeditems
                // from the new feed
                var items = originalItems.concat(newItems);
                items = _service.sortItems(items);
                //got date,config,context,url
                console.log(items);

                // context
                // var length = ( items.length < settings.limit ) ?   items.length :     settings.limit;
                //TODO should be used in filter instead

                //add correct class?



                //    // Trigger the feedloaded callback, if it is a function
                // if ((typeof settings.feedloaded === 'function')) {
                //     settings.feedloaded();
                // }

                return items;
            };

            /**
             * Fire up all the feeds and pass them the right arugments.
             * @private
             */

            _service.load = function() {

                var i = 0,
                    j = _service.settings.list.length;

                // We don't pass the list array to each feed  because this will create
                // a recursive JavaScript object
                // delete itemsettings.list;

                // Run over all the items in the list

                var feedPromises = [];


                for (; i < j; i++) {

                    var config = _service.settings.list[i];

                    // Check whether the feed exists, if the feed is a function and if a
                    // user has been filled in
                    if (_service.feeds[config.service] &&
                        (typeof _service.feeds[config.service] === "function") &&
                        config.user) {

                        // You'll be able to get the global settings by using
                        // config._settings in your feed
                        config._settings = _service.itemsettings;

                        // Call the feed with a config object and finished callback
                        var promise = _service.feeds[config.service](config).promise;
                        feedPromises.push(promise);
                    }

                }


                return feedPromises;

            };



            _service.feeds.facebook_page = function(config) {

                // var template = $.extend({}, {
                //         wall_post: 'post on wall <a href="${link}">${title}</a>'
                //     },
                //     config.template);
                // var template = {
                //     wall_post: 'post on wall <a href="${link}">${title}</a>'
                // };

                /**
                 * Parse the input from facebook
                 */
                var parseFBPage = function(input) {
                    var output = [],
                        list, i = 0,
                        j;

                    if (input.query && input.query.count && input.query.count > 0) {
                        list = input.query.results.rss.channel.item;
                        j = list.length;
                        for (; i < j; i++) {
                            var item = list[i];
                            if ($.trim(item.title)) {
                                output.push({
                                    date: new Date(item.pubDate),
                                    config: config,
                                    context: {
                                        "content": item.wall_post,
                                        "url": "",
                                        "title": item.title
                                    }
                                    //$.tmpl(template.wall_post, item)
                                });
                            }
                        }
                    }
                    return output;
                };


                var promise = _service.jsonpYql('select * from xml where url="' +
                    'www.facebook.com/feeds/page.php?id=' +
                    config.user + '&format=rss20"').then(
                    function(data, status) {
                        // var query = data.data.query;
                        // if (query && query.count > 0) {
                        //     return parseFBPage(query.results.items);
                        // } else {
                        //     return $q.reject('no data');
                        // }
                        console.log(arguments);

                    }, function(err) {
                        //TODO
                        console.log(err);
                    });



        // Expose the template.
        // We use this to check which templates are available
        return {
            "promise": promise
        };

    };


    _service.feeds.twitter = function(config) {
        // = $.extend({}, {
        //         "posted": '{{html tweet}}'
        //     },
        //     config.template);
        var jsonpCallbackName = 'jlsTwitterCallback' +
            config.user.replace(/[^a-zA-Z0-9]+/g, ''),


            //Twitter got some char encoded e.g. #39

            charEscapedByService = [{
                "escaped": "&#39;",
                "unescaped": "\'"
            }];


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

        },
        /**
         * Parse the input from twitter
         * @private
         * @param  {Object[]} items
         * @return {Object[]} Array of Twitter status messages.
         */
        parseTwitter = function(items) {
            var output = [],
                i = 0,
                j = items.length;

            for (i; i < j; i++) {
                var status = items[i];

                output.push({
                    "date": new Date(status.created_at * 1000), // unix time
                    "config": config,
                    "context": {
                        "tweet": linkify(status.text),
                        "complete_url": 'http://twitter.com/' + config.user +
                            "/status/" + status.id_str
                    },
                    "url": 'http://twitter.com/' + config.user
                });
            }

            return output;
        };
        //TODO didnt use the customized name. anyway to use that in angular?

        var promise = _service.jsonpYql('USE ' +
            '"http://arminrosu.github.io/twitter-open-data-table/table.xml" ' +
            'AS twitter; SELECT * FROM twitter WHERE screen_name = "' +
            config.user + '"')
            .then(function(data, status) {
                var query = data.data.query;
                if (query && query.count > 0) {
                    return parseTwitter(query.results.items);
                } else {
                    return $q.reject('no data');
                }

            }, function(err) {
                //TODO
                console.log(err);
            });
        return {
            "promise": promise
        };

    };
    /**
     * Create a valid YQL URL by passing in a query
     * @param {String} query The query you want to convert into a valid yql url
     * @return {String} A valid YQL URL
     */
    _service.createYqlUrl = function(query) {
        return (('https:' === document.location.protocol ? 'https' : 'http') +
            '://query.yahooapis.com/v1/public/yql?q=__QUERY__' +
            '&env=' + 'store://datatables.org/alltableswithkeys&format=json')
            .replace("__QUERY__", encodeURIComponent(query));
    };

    _service.jsonpYql = function(yql, config) {
        //TODO override config
        var url = _service.createYqlUrl(yql) + "&callback=JSON_CALLBACK";

        return $http.jsonp(url, {

            "cache": true,
            'data': {
                '_maxage': 300 // cache for 5 minutes
            }
        });

    };
    return _service;
}
return angularLifestreamServiceFactory;
});