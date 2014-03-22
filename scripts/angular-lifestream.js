define(['angular', 'angular-route', 'angular-lifestream-service', 'angular-lifestream-templates', 'spin-js', 'masonry'], function(angular, ngRoute, angularLifestreamService, angularLifestreamTemplates, Spinner, Masonry) {

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



  var app = angular.module('angular-lifestream', ["ngRoute", 'angular-lifestream-templates'])
    .config(['$provide',
      function($provide) {
        $provide.factory('angularLifestreamService', ['$http', '$q', '$interpolate', angularLifestreamService]);
      }
    ])
    .filter('serviceClassFilter', function() {
      return function(item) {
        if (item.config.customServiceClass) {
          return item.config.customServiceClass;
        } else {

          return 'lifestream' + '-' + item.config.service;
        }
        //TODO settings.classname
      };
    })
    .filter('serviceTemplateFilter', ['$templateCache',
      function($templateCache) {
        return function(item) {
          var serviceTemplateName = item.config.service + '-' + 'template';
          if (!$templateCache.get(serviceTemplateName)) {
            return 'default-template';
          } else {
            return serviceTemplateName;
          }
        };
      }
    ])
    .directive('lifestream', ['angularLifestreamService',
      function(angularLifestreamService) {
        var controller = function($scope, $element, $timeout) {
          console.log(angularLifestreamService);
          console.log('init angular lifestream');
          $scope.items = [];
          //no selector to select that children, use default name
          setupSpinLoad($element[0].querySelector('.spinner-placeholder'));

          //TODO spinner at bottom; end only after all feed loaded
          //effective config together with defaults
          $scope.config = angularLifestreamService.init($scope.config);
          //_service.itemsettings;

          var container = document.querySelector('#lifestream-container');
          var msnry = new Masonry(container, {
            // options
            // columnWidth: 1200,
            itemSelector: '.lifestream-item'
          });


          $scope.refresh = function() {
            //need keep refresh?

            console.log('masonry');
            //ideally bind after angularjs ng-repeat render, wait until scope.$last in child scope $scope.$$childHead, but seems resolve by timeout alone
            $timeout(function() {
            //better to use .addItems()?; to preprend at the back
              msnry.reloadItems();
              msnry.layout();
              console.log('masonry layout');
            });
            // }

          };
          var feedPromises = angularLifestreamService.load();
          angular.forEach(feedPromises, function(feedPromise) {
            feedPromise.then(function(newItems) {
              $scope.items = angularLifestreamService.finished($scope.items, newItems);

              $scope.refresh();

            });

          });

        };
        return {
          controller: controller,
          restrict: 'EA',
          require: '^ngModel',
          transclude: true,
          scope: {
            "config": "=config"
          },
          templateUrl: 'lifestreamTemplate.html'
        };


      }
    ]);

  return app;

});