define(['services/abstract'], function(abstractServiceFeed) {

      var ServiceFeed = abstractServiceFeed.factory();

      ServiceFeed.prototype.init = function() {
            this._config.customServiceClass = this._config.customServiceClass || "lifestream-github";
            this._config.isYql = true;
      };

      ServiceFeed.prototype.getYqlUrl = function() {
            return 'select ' +
                  'json.type, json.actor, json.repo, json.payload, json.created_at ' +
                  'from json where url="https://api.github.com/orgs/' +
                  this._config.user + '/events"';
      };

      //TODO don't use $intepolate here, use template
      //quick hack: expose from _service
      var parseGithubStatus = function(status, $interpolate) {


            if (status.type === 'CreateEvent' &&
                  status.payload.ref_type === 'repository') {
                  return $interpolate('<a target="_blank" href="https://github.com/{{actor.login}}">{{actor.login}}</a> created repository ' +
                        '<a href="http://github.com/' +
                        '{{repo.name}}">{{repo.name}}</a>')(status);
            } else if (status.type === 'CreateEvent' &&
                  status.payload.ref_type === 'branch') {
                  return $interpolate('<a target="_blank"  href="https://github.com/{{actor.login}}">{{actor.login}}</a> created branch <a href="http://github.com/{{repo.name}}/tree/{{payload.ref}}">{{payload.ref}}</a> at repository ' + '<a href="http://github.com/' +
                        '{{repo.name}}">{{repo.name}}</a>')(status);
            } else if (status.type === 'ForkEvent') {
                  return $interpolate('<a target="_blank"  href="https://github.com/{{actor.login}}">{{actor.login}}</a> forked repository ' +
                        '<a href="http://github.com/' +
                        '{{repo.name}}">{{repo.name}}</a>')(status);
            } else if (status.type === 'PushEvent') {
                  return $interpolate('<a target="_blank"  href="https://github.com/{{actor.login}}">{{actor.login}}</a> pushed {{count}} times to <a href="http://github.com/{{repo.name}}">{{repo.name}}</a>')(status);
            }
      };

      /**
       * @private
       * @param  {Object[]} items
       * @return {Object[]} Array of Twitter status messages.
       */
      ServiceFeed.prototype.parse = function(query) {
            var data = abstractServiceFeed.parseYqlRes(query);
            var items = data.results.json;
            var output = [],
                  aggregatedEvents = [],
                  i = 0,
                  j;

            //TODO study input
            // var filter = this._config.filter || []; 
            var filter = [];

            //TODO use org as alias now
            if (!filter.length) {
                  // filter = config.filter;
                  filter = ['CreateEvent', 'ForkEvent', 'PushEvent'];
            }
            //aggregate events like push
            //TODO add PR

            var $interpolate = this._service.angular_services.$interpolate;

            j = items.length;

            //originally sorted

            for (; i < j; i++) {
                  var status = items[i].json;
                  if (filter) {
                        if (filter.length) {
                              if (filter.indexOf(status.type) == -1) {
                                    continue;
                              }
                        }
                  }

                  var indexOflatestPushEventBySameActorRepo = function(events, eventToCompare) {
                        for (var k = 0; k < events.length; k++) {
                              var status = events[k].status;
                              var isSame = (status.actor.id === eventToCompare.actor.id) && (status.repo.id === eventToCompare.repo.id);
                              if (isSame) return k;
                        }
                        return -1;
                  };


                  //aggregate to the first(latest in time)
                  if (status.type === 'PushEvent') {
                        var index = indexOflatestPushEventBySameActorRepo(aggregatedEvents, status);
                        if (index > -1) {
                              aggregatedEvents[index].count++;
                              continue;
                        }
                        //else new one, push it
                  }

                  aggregatedEvents.push({
                        date: new Date(status.created_at),
                        status: status,
                        count: 1
                  });
            }

            for (var i = 0; i < aggregatedEvents.length; i++) {
                  var status = aggregatedEvents[i].status;
                  status.count = aggregatedEvents[i].count;

                  output.push({
                        date: new Date(status.created_at),
                        config: this._config,
                        context: {
                              "publisher": $interpolate('<a href="https://github.com/{{actor.login}}">{{actor.login}}</a>')(status),
                              "content": parseGithubStatus(status, $interpolate)
                        },
                        url: 'https://github.com/' + this._config.user
                  });

            }

            //after aggregate, so content can parse with variable like count

            console.log(output);
            // output



            return output;
      };



      return ServiceFeed;
});


// too complex, use $iterpolate inide plugin
// _service.feeds.github_org = function(config) {

//   //TODO running fx vs static config


//   // var template = $.extend({},
//   //   {
//   //     commitCommentEvent: 'commented on <a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>',
//   //     createBranchEvent: 'created branch <a href="http://github.com/' +
//   //       '${status.repo.name}/tree/${status.payload.ref}">' +
//   //       '${status.payload.ref}</a> at <a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>',
//   //     createRepositoryEvent: 'created repository ' +
//   //       '<a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>',
//   //     createTagEvent: 'created tag <a href="http://github.com/' +
//   //       '${status.repo.name}/tree/${status.payload.ref}">' +
//   //       '${status.payload.ref}</a> at <a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>',
//   //     deleteBranchEvent: 'deleted branch ${status.payload.ref} at ' +
//   //       '<a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     deleteTagEvent: 'deleted tag ${status.payload.ref} at ' +
//   //       '<a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     followEvent: 'started following <a href="http://github.com/' +
//   //       '${status.payload.target.login}">${status.payload.target.login}</a>',
//   //     forkEvent: 'forked <a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     gistEvent: '${status.payload.action} gist ' +
//   //       '<a href="http://gist.github.com/${status.payload.gist.id}">' +
//   //       '${status.payload.gist.id}</a>',
//   //     issueCommentEvent: 'commented on issue <a href="http://github.com/' +
//   //       '${status.repo.name}/issues/${status.payload.issue.number}">' +
//   //       '${status.payload.issue.number}</a> on <a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>',
//   //     issuesEvent: '${status.payload.action} issue ' +
//   //       '<a href="http://github.com/${status.repo.name}/issues/' +
//   //       '${status.payload.issue.number}">${status.payload.issue.number}</a> '+
//   //       'on <a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     pullRequestEvent: '${status.payload.action} pull request ' +
//   //       '<a href="http://github.com/${status.repo.name}/pull/' +
//   //       '${status.payload.number}">${status.payload.number}</a> on ' +
//   //       '<a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     pushEvent: 'pushed to <a href="http://github.com/${status.repo.name}' +
//   //       '/tree/${status.payload.ref}">${status.payload.ref}</a> at ' +
//   //       '<a href="http://github.com/${status.repo.name}">' +
//   //       '${status.repo.name}</a>',
//   //     watchEvent: 'started watching <a href="http://github.com/' +
//   //       '${status.repo.name}">${status.repo.name}</a>'
//   //   },
//   //   config.template),

//   var parseGithubStatus = function(status) {

//     if (status.type === 'CreateEvent' &&
//       status.payload.ref_type === 'repository') {

//       return $interpolate('<a href="https://github.com/{{actor.login}}">{{actor.login}}</a> created repository ' +
//         '<a href="http://github.com/' +
//         '{{repo.name}}">{{repo.name}}</a>')(status);
//     } else if (status.type === 'CreateEvent' &&
//       status.payload.ref_type === 'branch') {
//       return $interpolate('<a href="https://github.com/{{actor.login}}">{{actor.login}}</a> created branch <a href="http://github.com/{{repo.name}}/tree/{{payload.ref}}">{{payload.ref}}</a> at repository ' + '<a href="http://github.com/' +
//         '{{repo.name}}">{{repo.name}}</a>')(status);
//     }


//     // if (status.type === 'CommitCommentEvent' ) {
//     //   return $.tmpl( template.commitCommentEvent, {status: status} );
//     // }
//     // else if (status.type === 'CreateEvent' &&
//     //     status.payload.ref_type === 'branch') {
//     //   return $.tmpl( template.createBranchEvent, {status: status} );
//     // }
//     // else if (status.type === 'CreateEvent' &&
//     //     status.payload.ref_type === 'repository') {
//     //   return $.tmpl( template.createRepositoryEvent, {status: status} );
//     // }
//     // else if (status.type === 'CreateEvent' &&
//     //     status.payload.ref_type === 'tag') {
//     //   return $.tmpl( template.createTagEvent, {status: status} );
//     // }
//     // else if (status.type === 'DeleteEvent' &&
//     //     status.payload.ref_type === 'branch') {
//     //   return $.tmpl( template.deleteBranchEvent, {status: status} );
//     // }
//     // else if (status.type === 'DeleteEvent' &&
//     //     status.payload.ref_type === 'tag') {
//     //   return $.tmpl( template.deleteTagEvent, {status: status} );
//     // }
//     // else if (status.type === 'FollowEvent' ) {
//     //   return $.tmpl( template.followEvent, {status: status} );
//     // }
//     // else if (status.type === 'ForkEvent' ) {
//     //   return $.tmpl( template.forkEvent, {status: status} );
//     // }
//     // else if (status.type === 'GistEvent' ) {
//     //   if (status.payload.action === 'create') {
//     //     status.payload.action = 'created';
//     //   } else if (status.payload.action === 'update') {
//     //     status.payload.action = 'updated';
//     //   }
//     //   return $.tmpl( template.gistEvent, {status: status} );
//     // }
//     // else if (status.type === 'IssueCommentEvent' ) {
//     //   return $.tmpl( template.issueCommentEvent, {status: status} );
//     // }
//     // else if (status.type === 'IssuesEvent' ) {
//     //   return $.tmpl( template.issuesEvent, {status: status} );
//     // }
//     // else if (status.type === 'PullRequestEvent' ) {
//     //   return $.tmpl( template.pullRequestEvent, {status: status} );
//     // }
//     // else if (status.type === 'PushEvent' ) {
//     //   status.payload.ref = status.payload.ref.split('/')[2];
//     //   return $.tmpl( template.pushEvent, {status: status} );
//     // }
//     // else if (status.type === 'WatchEvent' ) {
//     //   return $.tmpl( template.watchEvent, {status: status} );
//     // }
//   },

//     // var filter = config.service.github_org.filter;
//     filter = [],
//     parseGithub = function(query) {
//       var items = query.results.json;
//       var output = [],
//         i = 0,
//         j;

//       //TODO study input

//       //TODO use org as alias now
//       if (!filter.length) {
//         // filter = config.filter;
//         filter = ['CreateEvent'];
//       }

//       j = items.length;
//       for (; i < j; i++) {
//         var status = items[i].json;
//         if (filter) {
//           if (filter.length) {
//             if (filter.indexOf(status.type) == -1) {
//               console.log('skip');
//               console.log(status);
//               continue;
//             }
//           }
//         }
//         output.push({
//           date: new Date(status.created_at),
//           config: config,
//           context: {
//             "content": parseGithubStatus(status),
//           },
//           url: 'https://github.com/' + config.user
//         });
//       }

//       return output;

//     };


//   //filter accept only CreateEvent
//   // url: 'https://api.github.com/orgs/' + config.user +
//   //   '/events',

//   var promise = _service.jsonpYql('select ' +
//     'json.type, json.actor, json.repo, json.payload, json.created_at ' +
//     'from json where url="https://api.github.com/orgs/' + config.user +
//     '/events"', parseGithub);



//   // Expose the template.
//   // We use this to check which templates are available
//   return {
//     "promise": promise
//   };

// };