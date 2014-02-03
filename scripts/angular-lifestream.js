define(['angular', 'angular-sanitize', 'angular-lifestream-service', 'spin-js'], function(angular, ngSanitize, angularLifestreamService, Spinner) {

  //TODO For non-amd
  // (function(window, angular, undefined) {
  // })(window, window.angular);

  console.log('bootstrap lifestream');

  var setupSpinLoad = function(target) {
    var opts = {
      lines: 9, // The number of lines to draw
      length: 8, // The length of each line
      width: 7, // The line thickness
      radius: 9, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    var spinner = new Spinner(opts).spin(target);

  };



  var app = angular.module('angular-lifestream', ['ngSanitize'])
    .config(['$provide',
      function($provide) {
        $provide.factory('angularLifestreamService', ['$http', '$q', '$interpolate',angularLifestreamService]);
      }
    ])
    .filter('serviceClassFilter', function() {
      return function(item) {
        if(item.config.customServiceClass){
          return  item.config.customServiceClass;
        }else{

        return 'lifestream' + '-' + item.config.service;
        }
        //TODO settings.classname
      };
    })
    .filter('serviceTemplateFilter', function($templateCache) {
      return function(item) {
        var serviceTemplateName = item.config.service + '-' + 'template';
        if (!$templateCache.get(serviceTemplateName)) {
          return 'default-template';
        } else {
          return serviceTemplateName;
        }
      };
    }, ['$templateCache'])
    .directive('lifestream', function(angularLifestreamService) {
      var controller = function($scope, $element) {
        console.log(angularLifestreamService);
        console.log('init angular lifestream');
        $scope.items = [];
        //no selector to select that children, use default name
        setupSpinLoad($element[0].querySelector('.spinner-placeholder'));

        //TODO spinner at bottom; end only after all feed loaded

        $scope.lifestreamConfig = {
          theme:"lifestream-light-theme",
          list: [
          {
            service: "github_org",
            user: "code4hk",
          },
           {
            service: "twitter",
            user: "code4hk"
          },
           {
            service: "facebook_page",
            user: "code4hk"
          }]
        };

        //effective config together with defaults
        $scope.lifestreamConfig = angularLifestreamService.init($scope.lifestreamConfig);
        //_service.itemsettings;

        var feedPromises = angularLifestreamService.load();
        angular.forEach(feedPromises, function(feedPromise) {
          feedPromise.then(function(newItems) {
            $scope.items = angularLifestreamService.finished($scope.items, newItems);
          });

        });

      };
      return {
        controller: controller,
        restrict: 'EA',
        require: '^ngModel',
        transclude: true,
        templateUrl: 'lifestreamTemplate.html'
      };


    }, ['angularLifestreamService']);

});