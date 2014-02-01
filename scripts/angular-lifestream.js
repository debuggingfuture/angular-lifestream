define(['angular', 'angular-lifestream-service'], function(angular,angularLifestreamService) {
  console.log('bootstrap lifestream');
  var app = angular.module('angular-lifestream', [])
    .config(['$provide',
      function($provide) {
        $provide.factory('angularLifestreamService', ['$http', angularLifestreamService]);
      }
    ])
    .directive('lifestream', function(angularLifestreamService) {
      var controller = function($scope) {
        console.log(angularLifestreamService);
        console.log('init angular lifestream');
        $scope.atoms = [{
          content: 'a'
        }, {
          content: 'b'
        }, {
          content: 'c'
        }, {
          content: 'd'
        }, {
          content: 'e'
        }];
        console.log($scope.atoms.length);


        $scope.lifestreamConfig = {
          list: [{
            service: "github_org",
            user: "code4hk",
          }, {
            service: "twitter",
            user: "code4hk"
          }]
        };

        angularLifestreamService.init($scope.lifestreamConfig);
        angularLifestreamService.load();


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


