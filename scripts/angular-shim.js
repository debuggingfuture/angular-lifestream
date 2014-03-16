//manually shim them

define("angular", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.angular;
    };
}(this)));

define("angular-route", ["angular","angular-animate"], function(){});
define("angular-animate", ["angular"], function(){});
define('angular-sanitize', ["angular"], function(){});
