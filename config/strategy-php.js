"use strict";
 
var passport = require('passport')
    , util = require('util');
 
function StrategyPhp(options, verify) {
    this.name = 'php';
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('php authentication strategy requires a verify function');
    this.verify = verify;
}
 
util.inherits(StrategyPhp, passport.Strategy);
 
StrategyPhp.prototype.authenticate = function authenticate(req) {
    var self = this;
  
    function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
    }

    this.verify(req, verified);
}
 
module.exports = StrategyPhp;