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
         service: "facebook_page",
         user: "code4hk"
       }]
     };

     //scope in directive is different, need pass in

   }
 ]);



 angular.element(document).ready(function() {
   angular.bootstrap(document, ['site']);
 });