
      // _service.feeds.facebook_page = function(config) {

      //   // var template = $.extend({}, {
      //   //         wall_post: 'post on wall <a href="${link}">${title}</a>'
      //   //     },
      //   //     config.template);
      //   // var template = {
      //   //     wall_post: 'post on wall <a href="${link}">${title}</a>'
      //   // };

      //   /**
      //    * Parse the input from facebook
      //    */
      //   var parseFBPage = function(input) {
      //     var output = [],
      //       list, i = 0,
      //       j;

      //     if (input.query && input.query.count && input.query.count > 0) {
      //       list = input.query.results.rss.channel.item;
      //       j = list.length;
      //       for (; i < j; i++) {
      //         var item = list[i];
      //         if ($.trim(item.title)) {
      //           output.push({
      //             date: new Date(item.pubDate),
      //             config: config,
      //             context: {
      //               "content": item.wall_post,
      //               "url": "",
      //               "title": item.title
      //             }
      //             //$.tmpl(template.wall_post, item)
      //           });
      //         }
      //       }
      //     }


      //     return output;
      //   };


      //   var promise = _service.jsonpYql('select * from xml where url="' +
      //     'www.facebook.com/feeds/page.php?id=' +
      //     config.user + '&format=rss20"', parseFBPage);

      //   // Expose the template.
      //   // We use this to check which templates are available
      //   return {
      //     "promise": promise
      //   };

      // };
