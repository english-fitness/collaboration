var env = process.env.NODE_ENV || 'development',
    config = require(__dirname + '/../config/config')[env],
    request = require('request'),
    qs = require('querystring'),
    logger = require('log4js').getLogger('debug');

var onlineBoards = [];

exports.addOnlineBoard = function(boardId){
	
}

exports.removeOnlineBoard = function(boardId){
	
}

exports.addOnlineUser = function(boardId, userId){
	
}

exports.removeOnlineUser = function(boardId, userId){
	
}

exports.updateOnlineBoardStatus = function(boardId, data){
	
}

exports.updateOnlineUserStatus = function(boardId, userId, data){
	
}

exports.getAllBoardStatus = function(boardId, userId){
	
}