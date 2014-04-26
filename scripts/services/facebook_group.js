define(['services/abstract'], function(abstractServiceFeed) {

      var ServiceFeed = abstractServiceFeed.factory();

      ServiceFeed.prototype.init = function() {
            this._config.customServiceClass = this._config.customServiceClass || "lifestream-facebook";
      };

      ServiceFeed.prototype.getJsonUrl = function() {
            return this._config.jsonUrl;
      };


      var parseFbPost = function(post) {
            // '<a href="https://github.com/{{actor.login}}">{{actor.login}}</a> created repository ' +
            //             '<a href="http://github.com/' +
            //             '{{repo.name}}">{{repo.name}}</a>'

            //better till last word, not last char
            var MESSAGE_CHAR_LIMIT = 250;
            var message = post.message;
            var messageExcerpt;

            var content;
            if(message){
                  content = message.length > MESSAGE_CHAR_LIMIT ? message.substr(0, MESSAGE_CHAR_LIMIT) + '...' : message;
            }
            //possibly story e.g. update group photo , add pictures etc
            if(post.type === 'photo' && post.story){
                  content = post.story;
            }


            return {
                  "content": content,
                  "publisher": post.from.name,
                  "thumbnail":post.picture
            }

      };

      ServiceFeed.prototype.parse = function(query) {
            var items = query.data.data;
            console.log('fb loaded count:' + items.length);
            //dirty tricks
            var $interpolate = this._service.angular_services.$interpolate;

            var output = [];
            //TODO study input
            // var filter = this._config.filter || []; 

            var groupUrl = 'https://www.facebook.com/groups/'+this._config.user;
            var filter = [];
            for (i = 0; i < items.length; i++) {
                  var post = items[i];
                  var postId = post.id.split('_')[1];
                  output.push({
                        date: new Date(post.created_time),
                        config: this._config,
                        context: parseFbPost(post),
                        url: groupUrl+'/permalink/' + postId,
                        groupUrl: groupUrl  //TODO better use group alias, but can only input from user, not exists in response
                  });
            }

            return output;
      };



      return ServiceFeed;
});