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
     throw new Error('ServiceFeed#getYqlUrl must be overridden by subclass if to use');
   };
   ServiceFeed.prototype.getJsonUrl = function() {
     throw new Error('ServiceFeed#getJsonUrl must be overridden by subclass if to use');
   };

   ServiceFeed.prototype.load = function() {

    //TODO refactor
    var promise=null;
    console.log(self._config);
    if(self._config.isYql){
      promise = self._service.jsonpYql(self.getYqlUrl(), self.parse.bind(self),self._config);
    }
    else{
      promise = self._service.loadJsonUrl(self.getJsonUrl(),self.parse.bind(self), self._config);
    }

     return {
       "promise": promise
     };
   };


      //TODO 
      //separate parse & DOM gen
      

   ServiceFeed.prototype.parse = function() {
     throw new Error('ServiceFeed#parse must be overridden by subclass');
   };

   //util TODO extract
    ServiceFeed.parseYqlRes = function(query){
        return query.data.query;
      }


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