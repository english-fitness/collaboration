var env = process.env.NODE_ENV || 'development',
    config = require(__dirname + '/../config/config')[env],
    request = require('request'),
    qs = require('querystring'),
    logger = require('log4js').getLogger('debug'),
    BoardModel = require(__dirname + '/../models/BoardModel.js');

exports.getLoggedInUser = function(req, callback) {
    var boardId = req.params.boardId ? req.params.boardId : '';

    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(!err) {
            var params = {sessionId: board.p('sessionId')};
            var url = config['phpUrl'] + '/user/getLoggedInUser?' + qs.stringify(params);
            var options = {url: url, headers: {'Cookie': req.get('Cookie')}, rejectUnauthorized: false};
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body);
                    if(result.success == true) {
                        callback && callback(null, result.user);
                    } else {
                        callback && callback('unauthorized');
                    }
                } else {
                    callback && callback('not able to request');
                    logger.error('getLoggedInUser: not able to request');
                }
            });
        } else {
            callback && callback('Board not found');
        }
    });
}