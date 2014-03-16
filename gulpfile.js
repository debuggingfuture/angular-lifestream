var lr = require('tiny-lr');
var gulp = require('gulp');
var gulputil = require('gulp-util');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
// var imagemin = require('gulp-imagemin');
var livereload = require('gulp-livereload');
var templateCache = require('gulp-angular-templatecache');

// var rjs = require('gulp-requirejs');
var rjs = require('requirejs')
var rjsConfig = require('./scripts/requirejsConfig');
var concatJs = function() {

    //confession: using requirejs in this is perhaps overkill


// You should use the mainConfigFile build option to specify the file where to find the shim config. 
// Otherwise the optimizer will not know of the shim config. The other option is to duplicate the shim config in the build profile.
    console.log(rjsConfig);
    rjsConfig.baseUrl = "scripts";
    // rjsConfig.name = "almond";
    // rjsConfig.include =['templates','angular-lifestream'];

    //another pbm: templates generated need shim, no direct
    //scripts there but failed to load module

    // rjsConfig.dir='dist/scripts';
    // rjsConfig.wrap= true;
    rjsConfig.optimize='none',

    // rjsConfig.modules=[{name:"almond",include:['angular-lifestream-templates','angular-lifestream'],
    // exclude:['angular','angular-route','angular-cookies']}
    // ];

    rjsConfig.name="almond";
    rjsConfig.out='dist/scripts/angular-lifestream.min.js';
    rjsConfig.include=['angular-lifestream-templates','angular-lifestream','angular-shim'];
    rjsConfig.insertRequire= ['angular-lifestream'];

    //shim should stay, not the actual thing, how is that possible?
    rjsConfig.exclude=['angular','angular-route','angular-sanitize','angular-animate'];


//still need guarntee order

    //we dont want angularjs stuff to package as a whole
    // console.log(rjsConfig);
    // rjs.config(rjsConfig);
    return rjs.optimize(rjsConfig);
    // // .pipe(
    // //     uglify({
    // //     outSourceMap: true
    // // }))
    //     .pipe(gulp.dest('dist/scripts/')); // pipe it to the output DIR

};

server = lr();

gulp.task('template', function (cb) {
    gulp.src('lifestreamTemplate.html')
        .pipe(templateCache('templates.js',{
            module:'angular-lifestream-templates',
            standalone:true
        }))
        .pipe(gulp.dest('scripts')).on('end',cb);
});

gulp.task('build',['template'],function() {
    concatJs();
});

//TODO watch the template and re-run the template tasks

gulp.task('default', ['reload']);
gulp.task('reload', ['listen','template'], function() {
    gulp.src(['*.html','*.css'])
        .pipe(watch())
        .pipe(livereload(server));
});

gulp.task('listen', function(next) {
    server.listen(35729, function(err) {
        if (err) return console.error(err);
        next();
    });
});

