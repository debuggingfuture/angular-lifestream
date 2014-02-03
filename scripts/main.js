require(['angular', 'angular-lifestream'], function(angular) {
  console.log('bootstrap site');
  var app = angular.module('site', ["angular-lifestream"])
  
  angular.bootstrap(document, ["site"]);


});