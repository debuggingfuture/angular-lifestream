 //abstract class for feed service
 define([], function() {

   //need the service
   ServiceFeed = function(service,config) {
    this._service = service;
    this._config = config;
    this.init();
   };
   ServiceFeed.prototype.init = function() {

   };
   ServiceFeed.prototype.getYqlUrl = function() {
    console.log('getYqlUrl init');
     throw new Error('ServiceFeed#getYqlUrl must be overridden by subclass');
   };

   ServiceFeed.prototype.load = function() {
     var promise = this._service.jsonpYql(this.getYqlUrl(), this.parse.bind(this));
     return {
       "promise": promise
     };
   };

   ServiceFeed.prototype.parse = function() {
     throw new Error('ServiceFeed#parse must be overridden by subclass');
   };


   //factory to create ServiceFeed using this abstract feed as prototype
   ServiceFeed.factory = function() {
    var CreatedServiceFeed = function(service, config) {
        ServiceFeed.call(this, service, config);
    };
    CreatedServiceFeed.prototype = Object.create(ServiceFeed.prototype);
    CreatedServiceFeed.constructor = CreatedServiceFeed;
    return CreatedServiceFeed;
   };

   //register itself?

   return ServiceFeed;
 });