var BoardModel = require(__dirname + '/../models/BoardModel.js');
var ShapesModel = require(__dirname + '/../models/ShapesModel.js');
var UserModel = require(__dirname + '/../models/UserModel.js');
var Nohm = require('nohm').Nohm;
var noop = function() {};
var logger = require('log4js').getLogger('debug');

module.exports = function (redisClient, app) {
    redisClient.on("error", function (err) {
        logger.error("Error " + err);
    });

    redisClient.on("connect", function() {
        Nohm.setPrefix('collaboration'); //setting up app prefix for redis
        Nohm.setClient(redisClient);
        console.log("Nohm Connected to Redis Client");
    });

    Nohm.logError = function (err) {
        if (err) {
            logger.error("Nohm::error:" + err);
        }
    };
}