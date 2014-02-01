console.log('hello world');

require(['angular'], function(angular) {

  // $("#lifestream").lifestream({
  //   list: [{
  //     service: "github_org",
  //     user: "code4hk",
  //   }, {
  //     service: "twitter",
  //     user: "code4hk"
  //   }]
  // });



});

require(['angular', 'angular-lifestream'], function(angular) {
  console.log('bootstrap site');
  var app = angular.module('site', ["angular-lifestream"])
  
  angular.bootstrap(document, ["site"]);


});