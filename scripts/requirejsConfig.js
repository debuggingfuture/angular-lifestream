console.log('init requirejs config');
var require = {
    "map": {},
    "paths": {
        "angular": "../bower_components/angular/angular",
        "angular-route": "../bower_components/angular-route/angular-route",
        "angular-cookies": "../bower_components/angular-cookies/angular-cookies",
        "angular-resource": "../bower_components/angular-resource/angular-resource",
        "angular-animate": "../bower_components/angular-animate/angular-animate",
        "angular-sanitize": "../bower_components/angular-sanitize/angular-sanitize",
        "angular-lifestream": "angular-lifestream",
        "angular-lifestream-service": "angular-lifestream-service",
        "spin-js": "../bower_components/spin.js/spin",
        "angular-lifestream-templates": "templates",
        "angular-shim": "angular-shim",
        "masonry": "../bower_components/masonry/dist/masonry.pkgd",
        "angular-busy": "../bower_components/angular-busy/dist/angular-busy"
    },
    "shim": {
        "angular": {
            "exports": "angular"
        },
        "angular-bootstrap": {
            "deps": [
                "angular"
            ]
        },
        "angular-route": {
            "deps": [
                "angular", "angular-animate"
            ]
        },
        "angular-sanitize": {
            "deps": [
                "angular"
            ]
        },
        "angular-animate": {
            "deps": [
                // "angular-route"
                "angular"
            ]
        },
        "angular-lifestream-templates": {
            "deps": [
                "angular"
            ]
        },
        "masonry": {
            "exports": "Masonry"
        },
        "angular-busy": {
            "deps": [
                "angular"
            ],
            "exports": "busy"
        },
        "underscore":{
            "deps":["underscore"]
        },
        "underscore.string":{
            "deps":["underscore"]
        },
        
        // "angular-masonry":{
        //     "deps":[
        //     "angular","masonry"
        //     //temp
        //     ]
        // }
    },
    "baseUrl": "scripts"
};

if (typeof(module) != 'undefined') {
    module.exports = require;
}