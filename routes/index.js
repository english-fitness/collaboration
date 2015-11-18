var noop = function() {};
var BoardModel = require(__dirname + '/../models/BoardModel.js');
var ShapesModel = require(__dirname + '/../models/ShapesModel.js');
var UserModel = require(__dirname + '/../models/UserModel.js');
var MessageModel = require(__dirname + '/../models/MessageModel.js');
var async = require('async');
var events = require('events');
var fs = require('fs');
var path = require("path");
var _ = require('underscore');

var logger = require('log4js').getLogger('debug');
var config = null;

module.exports = {
    init: function(_config) {
        config = _config;
        return this;
    },
    index: function (req, res) {
        var user = req.user;
        var renderDashboard = function(res, ownedBoards) {
            var defaults = {
                title:'Day Kem Truc Tuyen' ,
                createdNum: 0,
                ownedBoards:  [],
            }, actualValues = {};

            actualValues['title'] = defaults.title;
            actualValues['ownedBoards'] = (ownedBoards)? ownedBoards: defaults.ownedBoards;
            actualValues['createdNum'] = actualValues['ownedBoards'].length;
            actualValues['user'] = user;
            actualValues['baseUrl'] = config['baseUrl'];

            res.render('index', actualValues);
        };
        var collectBoards = function(req, res, boardIds, callback) {
            var boards = [], i = 0, props, board = new BoardModel(), boardCount = boardIds.length;

            boardIds.forEach(function (id) {
                var board = new BoardModel();
                board.load(id, function (err, props) {
                    if (err) {
                        logger.debug('Error when collect boards');
                        renderDashboard(res);
                    } else {
                        boards.push ({
                            id:this.id,
                            boardId: props.boardId,
                            name: props.name,
                            container: props.container,
                            canvasWidth: props.canvasWidth,
                            canvasHeight: props.canvasHeight
                        });
                        if (++i === boardCount) {
                            callback(boards);
                        }
                    }
                });
            });
            if (boardIds.length === 0) {
                callback(boards);
            }
        };

        var ownedBoards =  [];

        if(req.user){
            var loggedInUser = new UserModel();

            async.waterfall([
                function(callback){
                    loggedInUser.find({userId:user.userId}, function(err,ids) {
                        if (err) {
                            callback(err);
                        } else {
                           callback(null, ids[0]);
                        }
                    });
                },
                function(id, callback) {
                    loggedInUser.load(id, function (err, props) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                },
                function(callback) {
                    loggedInUser.getAll('Board', 'ownedBoard', function (err, boardIds) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, boardIds);
                        }
                    });
                },
                function(boardIds, callback) {
                    collectBoards(req, res, boardIds, function(boards) {
                        ownedBoards = boards;
                        callback(null);
                    });
                }

            ], function (err) {
               renderDashboard(res, ownedBoards);
            });

        }else{
            res.render("index", { user : null, baseUrl: config['baseUrl']});
        }
    },

    boards: {
        create:function (req, res, next) {
            var user = req.user;
            var userObj = new UserModel();
            var p2p = config['p2p'];
            var sessionType = config['sessionType'];

            var data = {
                container: 'desktop-1366x768',
                canvasWidth: '1086',
                canvasHeight: '768',
                //container: req.body.container,
                //canvasWidth: req.body.canvasWidth,
                //canvasHeight: req.body.canvasHeight,
                name: req.body.whiteboardName,
                sessionType:sessionType,
                nuve: 0
            };

            createBoard(data, p2p, function(err, board) {
                userObj.linkBoard(board, user.userId, false);
                res.redirect(config['baseUrl'] + 'boards/'+board.p('boardId'));
            });

        },

        createTab: function(req, res, next) {
            var user = req.user;
            var userObj = new UserModel();

            var randomstring = createRandomString();
            var parentId = req.body.parentId;

            if(!parentId) {
                var response = {'success': false, 'reason': 'no parent'};
                res.json(response);
                return;
            }

            BoardModel.loadByBoardId(parentId, function(err, board) {
                if(err) {
                    logger.debug('Cant load parent:' + err);
                    var response = {'success': false, 'reason': 'cant load parent'};
                    res.json(response);
                } else {
                    var parentBoard = board;
                    var students = req.body.students?req.body.students : '[]';
                    var data = {
                        boardId:randomstring,
                        container: parentBoard.p('container'),
                        canvasWidth: parentBoard.p('canvasWidth'),
                        canvasHeight: parentBoard.p('canvasHeight'),
                        name: req.body.whiteboardName,
                        students:students,
                        parentId: parentId,
                    };
                    var childBoard = new BoardModel();

                    childBoard.store(data, function (err) {
                        if (err === 'invalid') {
                            logger.debug('Cant create child board:' + err);
                            next(childBoard.errors);
                        } else if (err) {
                            logger.debug('Cant create child board:' + err);
                            next(err);
                        } else {
                            logger.debug('Create subtab successfully');
                            // parentBoard.p('active', randomstring);
                            // parentBoard.save(function(err){
                            //     if(err) {
                            //         logger.debug('Cant update parent:' + parentId + ", err:" + err);
                            //     }
                            // });

                            var response = {'success': true, 'boardId': randomstring,data:childBoard.allProperties()};
                            res.json(response);
                        }
                    });
                }
            });
        },
        removeTab: function(req, res, next) {
            var user = req.user;
            var userObj = new UserModel();

            var boardId = req.body.boardId;
            var activeBoardId = req.body.activeBoardId;

            BoardModel.loadByBoardId(boardId, function(err, board) {
                if(err) {
                    logger.debug("Cant find the board:" + boardId + " to delete. Err:" + err);
                    var response = {'success': false};
                    res.json(response);
                } else {
                    var parentId = board.p('parentId');

                    if(parentId == '') {
                        var response = {'success': false};
                        res.json(response);
                    } else {
                        BoardModel.findAndLoad({boardId: parentId}, function(err, parentBoards) {
                            if (err) {
                                logger.debug("Cant find parent:" + parentId);
                            } else {
                                var parent = parentBoards[0];
                                parent.p('active', activeBoardId);
                                parent.save(function(err){
                                    if(err) {
                                        logger.debug('Cant update parent:' + parentId + ', err:'+ err);
                                    }
                                });
                            }
                        });

                        removeBoard(board, function() {
                            var response = {'success': true};
                            res.json(response);
                        });
                    }
                }
            });
        },

        remove:function (req, res, next) {
            var boardId = req.body.boardUrl;
            var userObj = new UserModel();
            var user = req.user;

            BoardModel.loadByBoardId(boardId, function(err, board) {
                if(err) {
                    logger.debug(err);
                } else {
                    var parentId = board.p('parentId');
                    if(parentId != '') {
                        res.writeHead(200, {'Content-Type': 'text/plain' });
                        res.end("not parent");
                    } else {
                        BoardModel.findAndLoad({parentId: boardId}, function(err, children) {
                            children.forEach(function(child) {
                                removeBoard(child, noop);
                            });
                        });

                        removeMessages(boardId);

                        userObj.linkBoard(board, user.userId, true, function () {
                            removeBoard(board, function(err) {
                                logger.debug("Deleted board: "+board.p('boardId'));
                                res.writeHead(200, {'Content-Type': 'text/plain' });
                                res.end("deleted");
                            });
                        });

                    }

                }
            });

        },
        update: function(req, res, next) {
            var user = req.user;
            var whiteBoard = new BoardModel();
            whiteBoard.load(req.body.id, function (err, props) {
                if (err) {
                    logger.debug("Update err: " + err);
                    res.json({error: true});
                } else {
                    props.name = req.body.name;
                    whiteBoard.store(props, function (err) {
                        if (err === 'invalid') {
                            res.json({error: true});
                        } else if (err) {
                            res.json({error: true});
                        } else {
                            res.json({success: true});
                        }
                    });
                }
            });
        },
        show: function(req, res, next) {
            var boardId = req.params.boardId.replace(/[^a-zA-Z 0-9]+/g,'').toString();

            BoardModel.loadByBoardId(boardId, function(err, board) {
                if(err) {
                    logger.debug("Board not found:" + boardId + ", err: " + err);
                    res.status(404).send('Not found!');
                } else {
                    var allowedUsers = board.p('users');

                    if((req.user.role == 'role_student' || req.user.role == 'role_teacher') &&  !_(allowedUsers).has(req.user.userId)) {
                        res.status(403).send('You are not allowed to enter this class');
                    } else {
                        var jsFile = config['optimized'] ? 'built/'+config['js'] : "javascripts/main.js";
                        var cssFile = config['optimized'] ? 'built/'+config['css'] : "stylesheets/main.css";
                        var googleTag  = config['googleTag'];
                        var baseUrl = config['baseUrl'];
                        res.render('board.html', {baseUrl: baseUrl, jsFile: jsFile, cssFile: cssFile,googleTag: googleTag});
                    }
                }
            });
        }
    },

    api: {
        create: function(req, res, next) {
            if(!isAuthorizedForApi(req)) {
                res.status(403).send('Forbidden!');
            } else {
                var p2p = req.param('p2p') ? req.param('p2p') : config['p2p'];
                var mode=req.param('mode')?req.param('mode'):'1';//set mode
                var nuve = req.param('nuve') ? req.param('nuve') : 0;
                var sessionType = req.param('sessionType') != undefined ? req.param('sessionType') : config['sessionType'];
                var sessionId = req.param('sessionId') != undefined ? req.param('sessionId') : 0;
                var sessionPlanStart = req.param('sessionPlanStart') != undefined ? req.param('sessionPlanStart')*1000 : new Date().getTime();
                var users = req.param('users') ? req.param('users') : '{}';
                var students = req.param('students') ? req.param('students') : '[]';
                
                var data = {
                    container: 'desktop-1366x768',
                    canvasWidth: '1086',
                    canvasHeight: '768',
                    name: 'Main Board',
                    users: users,
                    students:students,
                    sessionId: sessionId,
                    sessionType: sessionType,
                    sessionPlanStart: sessionPlanStart,
                    nuve: nuve,
                    mode:mode
                };
                createBoard(data, p2p, function(err, board) {
                    var response = {'success': false};
                    if(!err) {
                        response = {'success': true, 'boardId': board.p('boardId'),'data':board.allProperties()};
                    }
                   res.json(response);
                });
            }
        },

        update: function(req, res, next) {
            if(!isAuthorizedForApi(req)) {
                res.status(403).send('Forbidden!');
            } else {
                var boardId = req.param('boardId');
                var mode=req.param('mode')?req.param('mode'):'1';//set mode
                var response = {'success': false};

                var sessionId = req.param('sessionId') != undefined ? req.param('sessionId') : 0;
                var sessionType = req.param('sessionType') != undefined ? req.param('sessionType') : config['sessionType'];
                var sessionPlanStart = req.param('sessionPlanStart') != undefined ? req.param('sessionPlanStart')*1000 : new Date().getTime();
                var users = req.param('users') ? req.param('users') : '{}';
                
              
                
                BoardModel.loadByBoardId(boardId, function(err, board) {
                    if(err) {
                        logger.debug(err);
                        response.reason = 'not found';
                        res.json(response);
                    } else {
                        board.p('sessionId', sessionId);
                        board.p('users', users);
                        board.p('sessionType', sessionType);
                        board.p('sessionPlanStart', sessionPlanStart);
                        board.p('mode', mode);
                        board.save(function(err) {
                            response = {'success': true};
                            res.json(response);
                        });
                    }
                });
            }
        },

        remove: function(req, res, next) {
            if(!isAuthorizedForApi(req)) {
                res.status(403).send('Forbidden!');
            } else {
                var boardId = req.param('boardId');

                var response = {'success': false};

                BoardModel.loadByBoardId(boardId, function(err, board) {
                    if(err) {
                        logger.debug(err);
                        response.reason = 'not found';
                        res.json(response);
                    } else {
                        var parentId = board.p('parentId');
                        if(parentId != '') {
                            response.reason = 'not parent';
                            res.json(response);
                        } else {
                            BoardModel.findAndLoad({parentId: boardId}, function(err, children) {
                                children.forEach(function(child) {
                                    removeBoard(child, noop);
                                });
                            });

                            removeBoard(board, function(err) {
                                response = {'success': true};
                                res.json(response);
                            });

                        }
                    }
                });
            }
        },
    },

    upload: function(req, res) {
        var allowExtensions = ["gif", "jpeg", "jpg", "png", "bmp", "pdf"];
        var allowFileTypes = ["image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png", "image/bmp", "application/pdf"];
        var success = false;

        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var extension = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
            mimetype = mimetype.toLowerCase();

            if(allowExtensions.indexOf(extension) >= 0 && allowFileTypes.indexOf(mimetype) >= 0) {
                success = true;
                var old_umask = process.umask();
                process.umask(0);
                fs.mkdir(__dirname + "/../public/uploads/users/" + req.user.userId, 0775, function(err){
                    if(!err || (err && err.code === 'EEXIST')) {
                        var saveTo = __dirname + "/../public/uploads/users/" + req.user.userId + "/" + filename;
                        var writeStream = fs.createWriteStream(saveTo);
                        file.pipe(writeStream);
                        writeStream.on('finish', function() {
                            var url = config['baseUrl'] +"uploads/users/" + req.user.userId + "/" + filename;
                            res.json({'success': true, 'url': url});
                        });

                    } else {
                        logger.error("Cant create directory: " + err);
                        res.json({'success': false, 'reason': 'Lỗi thư mục'});
                    }
                });
                process.umask(old_umask);

            } else {
                success = false;
                file.resume();
            }
        });

        req.busboy.on('finish', function() {
            if(!success) {
                res.json({'success': false, 'reason': 'File tải lên không hợp lệ'});
            }
        });

        var headers = req.headers;

        if(headers['content-length'] && headers['content-length'] > 128 * 1024 * 1024) {
            res.json({'success': false, 'reason': 'File quá lớn, chỉ được tải lên file nhỏ hơn 4MB'});
        } else {
            req.pipe(req.busboy);
        }

    },

    removeFile: function(req, res) {
        var path = req.param('path');
        if(path == undefined) {
            res.json({'success': false, 'reason': 'no parameter'});
            return;
        }

        path = path.substring(config['baseUrl'].length);
        var folders = path.split('/');
        var userId = folders[2];
        if(req.user.userId != userId) {
            res.json({'success': false, 'reason': 'no authorized'});
            return;
        }

        var path = __dirname + "/../public/" + path;
        fs.unlink(path, function(err) {
            if(err) {
                res.json({'success': false, 'reason': 'cant remove file'});
            } else {
                res.json({'success': true});
            }
        });
    },

    listUploaded: function(req, res) {
        var p = __dirname + "/../public/uploads/users/" + req.user.userId;
        var root = p + '/';
        scan(p, '', root, function(err, results) {
            if(!err) {
                res.json({'success': true, 'files': results, 'path': config['baseUrl'] + "uploads/users/" + req.user.userId + "/"});
            } else {
                res.json({'success': false, 'reason': 'cant read'});
            }
        });
    }
}

var scan = function(dir, suffix, root, callback) {
    fs.readdir(dir, function(err, files) {
        if(err) {
            callback('cant read dir ' + dir);
        } else {
            var returnFiles = {};
            async.each(files, function(file, next) {
              var filePath = dir + '/' + file;
              fs.stat(filePath, function(err, stat) {
                if (err) {
                  return next(err);
                }
                if (stat.isDirectory()) {
                  scan(filePath, suffix, root, function(err, results) {
                    if (err) {
                      return next(err);
                    }
                    returnFiles[file] = results;
                    next();
                  })
                }
                else if (stat.isFile()) {
                  if (file.indexOf(suffix, file.length - suffix.length) !== -1) {
                    var shortPath = filePath.replace(root, "");
                    returnFiles[file] = shortPath;
                  }
                  next();
                }
              });
            }, function(err) {
              callback(err, returnFiles);
            });
        }
    });
};


var createRandomString = function() {
    var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
    var string_length = 12;
    var randomstring = '';

    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

var createBoard = function(data, p2p, callback) {
    var boardId = createRandomString();
    boardId+='mode'+data.mode;
    data.boardId = boardId;
    data.active = boardId;
    data.parentId = '';
    data.sync = 1;
    data.files = [];
    data.p2p = p2p;
    var board = new BoardModel();

    board.store(data, function (err) {
        if (err) {
            logger.debug('Creating Board Error: ' + err);
        } else {
            logger.debug('Created Board ' + boardId + " for licode");
        }
        callback(err, board);
    });
};

var removeBoard = function(board, callback) {
    var boardId = board.p('boardId');
    ShapesModel.findAndLoad({boardId: boardId}, function(err, shapes) {
        if (err) {
            logger.debug(err);
        } else {
            shapes.forEach(function(shape) {
                shape.remove();
            });
        }
    });

    board.remove(function(err) {
        callback(err);
    });
};

var removeMessages = function(boardId, callback) {
    MessageModel.findAndLoad({boardId: boardId}, function(err, messages) {
        if (err) {
            logger.debug(err);
        } else {
            messages.forEach(function(message) {
                message.remove();
            });

            callback && callback();
        }
    });
}

var isAuthorizedForApi = function(req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(ip !== '127.0.0.1') {
        return false;
    }
    return true;
};
