'use strict';
define(['services/abstract'], function(abstractServiceFeed) {

      var ServiceFeed = abstractServiceFeed.factory();

      ServiceFeed.prototype.init = function() {
            this._config.customServiceClass = this._config.customServiceClass || "lifestream-facebook";
      };
//TODO refactor the url params
      ServiceFeed.prototype.getJsonUrl = function() {
            return this._config.jsonUrl+"?q="+this._config.keywords.join(",");
      };

      var parseFbPost = function(post) {
            // '<a href="https://github.com/{{actor.login}}">{{actor.login}}</a> created repository ' +
            //             '<a href="http://github.com/' +
            //             '{{repo.name}}">{{repo.name}}</a>'

            //better till last word, not last char
            var MESSAGE_CHAR_LIMIT = 250;
            var message = post.message;
            var messageExcerpt;
            //better interpolate inside?
            var content, link, linkDisplayed;
            if (message) {
                  content = message.length > MESSAGE_CHAR_LIMIT ? message.substr(0, MESSAGE_CHAR_LIMIT) + '...' : message;
            }
            //possibly story e.g. update group photo , add pictures etc
            if (post.type === 'photo' && post.story) {
                  content = post.story;
            }
            if (post.type === 'link') {
                  link = post.link;
                  linkDisplayed = post.name;
            }
            var media=null;

            if(post.picture || link){
                  media = {
                        "thumbnail": post.picture,
                        "link": link,
                        "linkDisplayed": linkDisplayed
                  }
            }

            var likeCount = post.likes.length;
            var commentCount = post.comments.data.length;

            return {
                  "content": content,
                  "publisher": post.from.name,
                  "media": media,
                  "likeCount" :likeCount,
                  "commentCount":commentCount
            }

      };

      ServiceFeed.prototype.parse = function(query) {
            var items = query.data.data;
            //dirty tricks
            var $interpolate = this._service.angular_services.$interpolate;

            var output = [];
            //TODO study input
            // var filter = this._config.filter || []; 

            var filter = [];
            for (var i = 0; i < items.length; i++) {
                  var post = items[i];
                  var postId = post.id.split('_')[1];
                  output.push({
                        date: new Date(post.created_time),
                        config: this._config,
                        template: 'facebook-template',
                        context: parseFbPost(post),
                        url: groupUrl + '/permalink/' + postId
                  });
            }

            return output;
      };


      return ServiceFeed;
});