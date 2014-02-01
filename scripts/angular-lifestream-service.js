define(
    ["angular"], function(angular) {
        //each feed as a ind services?
        var angularLifestreamServiceFactory = function($http) {


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
                // Sort the feeditems by date - we want the most recent one first
                items = items.sort(function(a, b) {
                    return (b.date - a.date);
                });
                return items;
            };

            //put in scope?
            //promise to load 
            /**
             * This method will be called every time a feed is loaded. This means
             * that several DOM changes will occur. We did this because otherwise it
             * takes to look before anything shows up.
             * We allow 1 request per feed - so 1 DOM change per feed
             * @private
             * @param {Array} newItems an array containing all the feeditems for a
             * specific feed.
             */
            _service.finished = function(newItems, data) {

                   // Merge the feed items we have from other feeds, with the feeditems
                   // from the new feed
                var items = data.items.concat(newItems);
                items = sortItems(items);
                //got date,config,context,url
                console.log(items);
                // var length = ( items.length < settings.limit ) ?   items.length :     settings.limit;
                //TODO should be used in filter instead

                //add correct class?



                //    // Trigger the feedloaded callback, if it is a function
                if ((typeof settings.feedloaded === 'function')) {
                    settings.feedloaded();
                }

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
                        _service.feeds[config.service](config, _service.finished);
                    }

                }

            };



            _service.feeds.facebook_page = function(config, callback) {

                // var template = $.extend({}, {
                //         wall_post: 'post on wall <a href="${link}">${title}</a>'
                //     },
                //     config.template);
                var template = {
                    wall_post: 'post on wall <a href="${link}">${title}</a>'
                };

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
                                    html: $.tmpl(template.wall_post, item)
                                });
                            }
                        }
                    }
                    return output;
                };

                $.ajax({
                    url: $.fn.lifestream.createYqlUrl('select * from xml where url="' +
                        'www.facebook.com/feeds/page.php?id=' +
                        config.user + '&format=rss20"'),
                    dataType: 'jsonp',
                    success: function(data) {
                        callback(parseFBPage(data));
                    }
                });

                // Expose the template.
                // We use this to check which templates are available
                return {
                    "template": template
                };

            };


            _service.feeds.twitter = function(config, callback) {
                var template = {
                    "posted": '{{html tweet}}'
                };
                // = $.extend({}, {
                //         "posted": '{{html tweet}}'
                //     },
                //     config.template);
                var jsonpCallbackName = 'jlsTwitterCallback' +
                    config.user.replace(/[^a-zA-Z0-9]+/g, ''),

                    /**
                     * Add links to the twitter feed.
                     * Hashes, @ and regular links are supported.
                     * @private
                     * @param {String} tweet A string of a tweet
                     * @return {String} A linkified tweet
                     */
                    linkify = function(tweet) {

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

                        return hash(at(link(tweet)));

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

                var url = _service.createYqlUrl('USE ' +
                    '"http://arminrosu.github.io/twitter-open-data-table/table.xml" ' +
                    'AS twitter; SELECT * FROM twitter WHERE screen_name = "' +
                    config.user + '"');
                url = url + "&callback=JSON_CALLBACK";

                //TODO didnt use the customized name. anyway to use that in angular?
                console.log(url);
                // jsonpCallbackName
                var jsonpPromise = $http.jsonp(url, {
                    "cache": true,
                    'data': {
                        '_maxage': 300 // cache for 5 minutes
                    }
                });

                jsonpPromise.success(function(data, status) {
                    console.log(arguments);
                    console.log('jsonp done');


                 if ( data.query && data.query.count > 0 ) {
                    callback(parseTwitter(data.query.results.items),null);
                  }

                }).error(function() {});

                // Expose the template.
                // We use this to check which templates are available
                return {
                    "template": template
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

            //provide the query as well
            // _service.getPathAndRelatedHeadlines = function($scope) {

            //     console.log('queryStr:' + $scope.query);

            //     //TODO escape the query string

            //     return $http({
            //         method: 'GET',
            //         url: '/getNLQResult',
            //         params: {
            //             queryStr: $scope.query
            //         }
            //     })

            // }
            return _service;
        }
        return angularLifestreamServiceFactory;
    });



// /**
//    * Initialize the lifestream plug-in
//    * @param {Object} config Configuration object
//    */
//   $.fn.lifestream = function( config ) {

//     // Make the plug-in chainable
//     return this.each(function() {

//       // The element where the lifestream is linked to
//       var outputElement = $(this),

//       // Extend the default settings with the values passed
//       settings = jQuery.extend({
//         // The name of the main lifestream class
//         // We use this for the main ul class e.g. lifestream
//         // and for the specific feeds e.g. lifestream-twitter
//         classname: "lifestream",
//         // Callback function which will be triggered when a feed is loaded
//         feedloaded: null,
//         // The amount of feed items you want to show
//         limit: 10,
//         // An array of feed items which you want to use
//         list: []
//       }, config),

//       // The data object contains all the feed items
//       data = {
//         count: settings.list.length,
//         items: []
//       },

//       // We use the item settings to pass the global settings variable to
//       // every feed
//       itemsettings = jQuery.extend( true, {}, settings ),

//       /**
//        * This method will be called every time a feed is loaded. This means
//        * that several DOM changes will occur. We did this because otherwise it
//        * takes to look before anything shows up.
//        * We allow 1 request per feed - so 1 DOM change per feed
//        * @private
//        * @param {Array} inputdata an array containing all the feeditems for a
//        * specific feed.
//        */
//       finished = function( inputdata ) {

//         // Merge the feed items we have from other feeds, with the feeditems
//         // from the new feed
//         $.merge( data.items, inputdata );

//         // Sort the feeditems by date - we want the most recent one first
//         data.items.sort( function( a, b ) {
//             return ( b.date - a.date );
//         });

//         var items = data.items,

//             // We need to check whether the amount of current feed items is
//             // smaller than the main limit. This parameter will be used in the
//             // for loop
//             length = ( items.length < settings.limit ) ?
//               items.length :
//               settings.limit,
//             i = 0, item,

//             // We create an unordered list which will create all the feed
//             // items
//             ul = $('<ul class="' + settings.classname + '"/>');

//         // Run over all the feed items + add them as list items to the
//         // unordered list
//         for ( ; i < length; i++ ) {
//           item = items[i];
//           if ( item.html ) {
//             $('<li class="'+ settings.classname + '-' +
//                item.config.service + '">').data( "name", item.config.service )
//                                           .data( "url", item.url || "#" )
//                                           .data( "time", item.date )
//                                           .append( item.html )
//                                           .appendTo( ul );
//           }
//         }

//         // Change the innerHTML with a list of all the feeditems in
//         // chronological order
//         outputElement.html( ul );

//         // Trigger the feedloaded callback, if it is a function
//         if ( $.isFunction( settings.feedloaded ) ) {
//           settings.feedloaded();
//         }

//       },

//       /**
//        * Fire up all the feeds and pass them the right arugments.
//        * @private
//        */
//       load = function() {

//         var i = 0, j = settings.list.length;

//         // We don't pass the list array to each feed  because this will create
//         // a recursive JavaScript object
//         delete itemsettings.list;

//         // Run over all the items in the list
//         for( ; i < j; i++ ) {

//           var config = settings.list[i];

//           // Check whether the feed exists, if the feed is a function and if a
//           // user has been filled in
//           if ( $.fn.lifestream.feeds[config.service] &&
//                $.isFunction( $.fn.lifestream.feeds[config.service] ) &&
//                config.user) {

//             // You'll be able to get the global settings by using
//             // config._settings in your feed
//             config._settings = itemsettings;

//             // Call the feed with a config object and finished callback
//             $.fn.lifestream.feeds[config.service]( config, finished );
//           }

//         }

//       };

//       // Load the jQuery templates plug-in if it wasn't included in the page.
//       // At then end we call the load method.
//       if( !jQuery.tmpl ) {
//         jQuery.getScript(
//           '//ajax.aspnetcdn.com/ajax/jquery.templates/beta1/' +
//           'jquery.tmpl.min.js',
//           load);
//       } else {
//         load();
//       }

//     });

//   };