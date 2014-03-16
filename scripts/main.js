require(['angular', 'masonry', 'angular-route', 'angular-animate', 'angular-sanitize', 'angular-lifestream'], function(angular, Masonry) {
    console.log('bootstrap site');
    var app = angular.module('site', ["ngRoute", 'ngAnimate', 'ngSanitize', "angular-lifestream"]);
//ngSanitize is important
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


            console.log(Masonry);
            // console.log('')

     
        }
    ]);


    angular.bootstrap(document, ["site"]);


});