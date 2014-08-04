define(['angular', 'angular-route', 'angular-lifestream-service', 'angular-lifestream-templates', 'masonry', 'angular-busy'], function(angular, ngRoute, angularLifestreamService, angularLifestreamTemplates, Masonry, busy) {

  //TODO For non-amd
  // (function(window, angular, undefined) {
  // })(window, window.angular);

  console.log('bootstrap lifestream');

  var app = angular.module('angular-lifestream', ["ngRoute", 'angular-lifestream-templates', 'cgBusy'])
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
          if(!item){
            return ;
          }
          if(item.template){
            return item.template;
          }
          var serviceTemplateName = item.config.service + '-' + 'template';
          if (!$templateCache.get(serviceTemplateName)) {
            return 'default-template';
          } else {
            return serviceTemplateName;
          }
        };
      }
    ])
    .directive('lifestream', ['angularLifestreamService', '$http','$q',
      function(angularLifestreamService, $http,$q) {
        var controller = function($scope, $element, $timeout) {
          $scope.items = [];
          //no selector to select that children, use default name
          // setupSpinLoad($element[0].querySelector('.spinner-placeholder'));

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

            //ideally bind after angularjs ng-repeat render, wait until scope.$last in child scope $scope.$$childHead, but seems resolve by timeout alone
            $timeout(function() {
              //better to use .addItems()?; to preprend at the back
              msnry.reloadItems();
              msnry.layout();
            });
            // }

          };

          var allLoaded = $q.defer();
          
          $scope.allLoadedPromise = allLoaded.promise;

          $scope.allLoadedPromise.then(function(){
            console.log('all loaded');
          })



     //scope in directive is different, need pass in
// cg-busy="{promise:allLoadedPromise,message:'Loading'}">
     $scope.angularBusyConfig = {
      promise:$scope.allLoadedPromise,
      message:'Loading it',
      templateUrl:'loading.html' //issue of this became relative url, better put in template cache
     }


          var feedCounter = 0;
          var feedPromises = angularLifestreamService.load();

          var feedLoaded = function() {
            feedCounter++;
            console.log(feedCounter);
            if(feedCounter == feedPromises.length){
              allLoaded.resolve();
            }
          };

          angular.forEach(feedPromises, function(feedPromise) {
            feedPromise.then(function(newItems) {
              $scope.items = angularLifestreamService.finished($scope.items, newItems);
              $scope.refresh();
              feedLoaded();
            });

          });

        };
        return {
          controller: ['$scope', '$element', '$timeout', controller],
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