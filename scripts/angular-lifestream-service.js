define(
  ["angular",
    "services/twitter",
    "services/facebook_group",
    "services/facebook_search",
    "services/github_org"
  ], function(angular, Twitter, Facebook_Group, Facebook_Search,Github_Org) {
    //each feed as a ind services?
    var _services_const = arguments;

    var angularLifestreamServiceFactory = function($http, $q, $interpolate) {

      var _service = {};
      //TODO another fx scope better than namespace?
      _service.settings = {},
      _service.itemsettings = angular.copy(_service.settings);
      _service.angular_services = {
        "$http": $http,
        "$q": $q,
        "$interpolate": $interpolate
      };
      _service.feeds = _service.feeds || {};


      //didnt use name as convention to load those scripts
      //alternative: don't use requirejs but simple build mechanism. as never use non-build version
      //or requirejs programatically  e.g. list of names + using arguments
      //same as file name
      _service.feedsToInclude = ['twitter', 'facebook_group','facebook_search', 'github_org'];
      var argOffset = 1;

      //TODO length of arguments check 
      console.log(_services_const);
      for (var i = 0; i < _service.feedsToInclude.length && argOffset+i< _services_const.length; i++) {
        _service.feeds[_service.feedsToInclude[i]] = _services_const[argOffset + i];
      };

      _service.init = function(config) {
        _service.settings = angular.extend({
          // The name of the main lifestream class
          // We use this for the main ul class e.g. lifestream
          // and for the specific feeds e.g. lifestream-twitter
          classname: "lifestream",
          // Callback function which will be triggered when a feed is loaded
          feedloaded: null,
          // The amount of feed items you want to show
          limit: 15,
          // An array of feed items which you want to use
          list: [],

          // TODO frequency in seconds to reload all feeds Note: YQL cached for minutes so this should bigger than that
          frequency : 60,
          theme: "lifestream-light-theme",
        }, config);
        _service.itemsettings = _service.settings;
        //TODO extend

        return _service.itemsettings;
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
       * This method will be called **every time a feed is loaded**. This means
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
        //add correct class?
        if ((typeof _service.settings.feedloaded === 'function')) {
          _service.settings.feedloaded();
        }

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
            (typeof _service.feeds[config.service] === "function")) {

            //TODO decouple construction and feed.load()
            //construct only necessary objects once
            // _service.feeds_constr stores constrctors
            // _service.feeds sotres created objects
            if (!_service.feeds[config.service]) {
              console.log('constructor undefined for service' + config.service);
              continue;
            }

            var serviceFeedLoad = new _service.feeds[config.service](_service, config).load;

            // You'll be able to get the global settings by using
            // config._settings in your feed
            config._settings = _service.itemsettings;

            // Call the feed with a config object and finished callback
            var promise = serviceFeedLoad().promise;
            feedPromises.push(promise);
          }

        }


        return feedPromises;

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


      var _doJsonp = function(url, parsingCb, config) {
          return $http.jsonp(url, {

          "cache": true,
          'data': {
            '_maxage': 300 // cache for 5 minutes
          }
        }).then(
          function(data, status) {
            if (typeof parsingCb !== 'function') {
              console.log('no parsing function provided');
            }
            //TODO better normalize it
            //TODO push this down into abstraction of yql services
            if (data ) {
              //key under results is service specifc depending on xml, e.g. items for twitter while json for github
              return parsingCb(data);
            } else {
              return $q.reject('no data');
            }

          }, function(err) {
            //TODO
            console.log(err);
          });
      };
      _service.jsonpYql = function(yql, parsingCb, config) {
        //TODO override config
        var url = _service.createYqlUrl(yql) + "&callback=JSON_CALLBACK";
        return _doJsonp(url, parsingCb, config);
      };

      _service.loadJsonUrl = function(url, parsingCb, config) {
        return _doJsonp(url+'?callback=JSON_CALLBACK', parsingCb, config);
      };

      return _service;
    }
    return angularLifestreamServiceFactory;
  });