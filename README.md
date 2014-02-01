This is a angular directive for social feeds based on jquery-lifestream by christianv


Features
- Support x social networks with (ideally easy) plug-in structure
- Responsive grid layout
- Default light / Dark theme
- only angular /spinner dependency
- Built in loading spinner

##Comparing with jquery-lifestream
- Use angular's templating instead of jquery template
- User angular's built-in jsonp support
- separate into controller and service, use the scope's items directly for rendering

##Controller - Service
when load feeds are fired, it returns array of promises which up to the controller to handle (e.g. DOM change) for each feed finish

##Plugin architecture
- Better to separate each service into one file
can use angular's factory to model each service and in library automatically load services by naming convention.
in this way to extend only need to use angular.module('angular-lifestream') to setup.
Meanwhile need to handle requirejs dependency in this case
+ve load only necessary files
-ve troublesome 

##to onboard new plugin
- add yql if missing 
- customized css
- add template
- add parsing logic

##Spinner
- should stop when all loading complete even with no results

##Responsive design
- Now bootstrap is used as a framework - but it is expected to be remove
- should think about in case it is present can we reuse those media querie

##Other TODOs
- support non amd
- allow disable of spinner
- Support backend accessSecret for private access if necessary
- Automatic refresh

##Templating

- Customize template
- Customized Default template
- Customized Service template
Use config to register angularjs template by service key, when exists will override
- Customized CSS for each service

##Supported Social Network Plugins:
[Twitter]
[Github - Organization] 
[Facebook page]
WIP - [Facebook group]  https://graph.facebook.com/195466193802264
