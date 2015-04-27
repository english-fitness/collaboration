var LocalStrategy = require('passport-local').Strategy;
var PHPStrategy = require('./strategy-php');
var UserModel = require(__dirname + '/../models/UserModel.js');
var extend = require('util')._extend;
var logger = require('log4js').getLogger('debug');

var UserHandle = require(__dirname + '/../classes/UserHandle.js');

module.exports = function (passport, config) {

    passport.serializeUser(function(user, done) {
        done(null, user.userId);
    });

    passport.deserializeUser(function(id, done) {
        UserModel.findAndLoad({userId: id}, function(err, users) {
            if(err) {
                done(err, null);
            } else {
                var data = users[0].allProperties();
                done(err, data);
            }
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function(username, password, done) {
        var fileUsers  = require('./users.js');
        var data = extend({}, fileUsers[username]);
        delete data.password;
        if(fileUsers[username] && fileUsers[username]['password'] == password) {
            UserModel.findAndLoad({userId: data['userId']}, function(err, users) {
                if(err) {
                    var newUser = new UserModel();
                    logger.debug(data);
                    newUser.store(data, function (err) {
                        if (!err) logger.debug("Saved new user to DB");
                        else logger.debug('Could not save user to DB:' + err);
                    });
                } else {
                    var user = users[0];
                    delete data.userId;
                    user.store(data, function (err) {
                        if (!err) logger.debug("Updated existed user to DB");
                        else logger.error('Could not update user to DB:' + err);
                    });
                }
            });

            return done(null, fileUsers[username]);
        } else {
            return done(null, false, { message: 'Invalid username or password' });
        }
    }));

    passport.use(new PHPStrategy(
    function(req, done) {
        UserHandle.getLoggedInUser(req, function(err, data) {
            if(!err) {
                logger.debug("User "+ data.email+ " has logged in");
                UserModel.findAndLoad({userId: data.userId}, function(err, users) {
                    if(err) {
                        var newUser = new UserModel();
                        newUser.store(data, function (err) {
                            if (!err) logger.debug("Saved new user to DB");
                            else logger.error('Could not save user to DB:' + err);
                        });
                    } else {
                        var user = users[0];
                        user.store(data, function (err) {
                            if (!err) logger.debug("Updated existed user to DB");
                            else logger.error('Could not update user to DB:' + err);
                        });
                    }
                });
                return done(null, data);
            } else {
                return done(null, false, { message: 'Unauthorized' });
            }
        });
    }));
}
