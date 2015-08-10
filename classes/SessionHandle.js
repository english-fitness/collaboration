var env = process.env.NODE_ENV || 'development',
    config = require(__dirname + '/../config/config')[env],
    request = require('request'),
    qs = require('querystring'),
    logger = require('log4js').getLogger('debug');

exports.startSession = function(sessionId, callback) {
    var params = {sessionId: sessionId};
    var url = config['phpUrl'] + '/session/start?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var result = JSON.parse(body);
                if(result.success == true) {
                    logger.debug('startSession::Start session successfully with sessionId:'+sessionId);
                } else {
                    logger.debug('startSession::Can not start sessionId:'+sessionId);
                }
            } catch(e) {
                callback && callback('exception from php');
                logger.error('startSession: exception from php, session:'+sessionId);
            }
        } else {
            logger.error('startSession::error with sessionId:'+sessionId);
        }
    });

    if( callback) callback();
}

exports.endSession = function(sessionId, actualDuration, callback){
    if (!actualDuration) actualDuration = 0;
    var params = {sessionId: sessionId, actualDuration: actualDuration};
    var url = config['phpUrl'] + '/session/end?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var result = JSON.parse(body);
                if(result.success == true) {
                    logger.debug('endSession::End session successfully with sessionId:'+sessionId);
                } else {
                    logger.debug('endSession::Can not end sessionId:'+sessionId);
                }
				callback(result.success);
            } catch(e) {
                // callback && callback('exception from php');
                logger.error('endSession: exception from php, session:'+sessionId);
            }
        } else {
            logger.error('endSession::error with sessionId:'+sessionId);
        }
    });

    // if (callback) callback();
}

exports.forceEndSession = function(sessionId, actualDuration, callback){
    if (!actualDuration) actualDuration = 0;
    var params = {sessionId: sessionId, actualDuration: actualDuration, forceEnd:1};
    var url = config['phpUrl'] + '/session/end?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var result = JSON.parse(body);
                if(result.success == true) {
                    logger.debug('endSession::End session successfully with sessionId:'+sessionId);
                } else {
                    logger.debug('endSession::Can not end sessionId:'+sessionId);
                }
				callback(result.success);
            } catch(e) {
                // callback && callback('exception from php');
                logger.error('endSession: exception from php, session:'+sessionId);
            }
        } else {
            logger.error('endSession::error with sessionId:'+sessionId);
        }
    });

    // if (callback) callback();
}

exports.getFeedbackUrls = function(sessionId, callback){
    var params = {sessionId: sessionId};
    var url = config['phpUrl'] + '/session/getFeedbackUrls?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var result = JSON.parse(body);
                if(result.success == true) {
                    callback && callback(null, result);
                } else {
                    callback && callback('session not existed');
                    logger.error('getFeedbackUrls: session not exist:'+sessionId);
                }
            } catch(e) {
                callback && callback('exception from php');
                logger.error('getFeedbackUrls: exception from php, session:'+sessionId);
            }
        } else {
            callback && callback('not able to request');
            logger.error('getFeedbackUrls: not able to request:'+sessionId);
        }
    });
}

exports.kickUser = function(sessionId, userId, callback){
    var params = {sessionId: sessionId, userId: userId};
    var url = config['phpUrl'] + '/session/kickUser?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var result = JSON.parse(body);
                if(result.success == true) {
                    callback && callback(null, result);
                } else {
                    callback && callback('kickUser not existed');
                }
            } catch(e) {
                callback && callback('exception from php');
                logger.error('kickUser: exception from php, session:'+sessionId);
            }

        } else {
            callback && callback('not able to request');
            logger.error('kickUser: not able to request, session:'+sessionId);
        }
    });
}

exports.setRecordFile = function(sessionId, filename, callback){
    var params = {id: sessionId, file:filename};
    var url = config['phpUrl'] + '/session/setRecordFile?' + qs.stringify(params);
    var options = {url: url, rejectUnauthorized: false};
    request(options, function(error, response, body){
		//do something
		//may be print the error
    });
}

exports.getSessionTimeUntilExpiration = function(sessionId, callback){
	var url = config['phpUrl'] + '/session/getTimeUntilExpiration?' + qs.stringify({sessionId: sessionId});
	var options = {url:url, rejectUnauthorized: false};
	request(options, function(error, response, body){
		if (!error && response.statusCode == 200) {
			var result = JSON.parse(body);
			callback(result.remainingTime);
		}
	});
}