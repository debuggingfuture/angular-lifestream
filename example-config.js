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
         user: "code4hk",
         jsonUrl: 'http://lifestream.dev.code4.hk/twitter'
       }, 
       // {
       //   service: "facebook_group",
       //   user: 614373621963841,
       //   jsonUrl: 'http://lifestream.dev.code4.hk/fbgroup'
         
       // },
       {
        service:"facebook_search",
        keywords:["新界東北"],
        jsonUrl: 'http://northeast.dev.code4.hk/fbsearch'
       }

       ]
     };

   }
 ]);



 angular.element(document).ready(function() {
   angular.bootstrap(document, ['site']);
 });