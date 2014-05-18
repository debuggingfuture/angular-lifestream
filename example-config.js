 var app = angular.module('site', ["ngRoute", "ngSanitize", "angular-lifestream", "cgBusy"]);
 //pbm: promise not in controller
 app.controller('lifestreamCtrl', ['$scope',
   function($scope) {
     $scope.lifestreamConfig = {
       theme: "lifestream-light-theme",
       list: [{
         service: "github_org",
         user: "code4hk",
       }, {
         service: "twitter",
         user: "code4hk"
       }, {
         service: "facebook_group",
         user: 614373621963841,
         jsonUrl: 'http://lifestream.dev.code4.hk/fbgroup'
         
       }]
     };

   }
 ]);



 angular.element(document).ready(function() {
   angular.bootstrap(document, ['site']);
 });