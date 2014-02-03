 //abstract class for feed service
 define([], function() {

   //need the service
   var self;
   ServiceFeed = function(service,config) {
    this._service = service;
    this._config = config;
    this.init();
    self = this;
   };
   ServiceFeed.prototype.init = function() {

   };
   ServiceFeed.prototype.getYqlUrl = function() {
     throw new Error('ServiceFeed#getYqlUrl must be overridden by subclass');
   };

   ServiceFeed.prototype.load = function() {
     var promise = self._service.jsonpYql(self.getYqlUrl(), self.parse.bind(self),self._config);
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