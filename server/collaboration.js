var async = require('async');
var logger = require('log4js').getLogger('debug');

var BoardModel = require(__dirname + '/../models/BoardModel.js');
var ShapesModel = require(__dirname + '/../models/ShapesModel.js');
var MessageModel = require(__dirname + '/../models/MessageModel.js');
var SessionHandle = require(__dirname + '/../classes/SessionHandle.js');

var io = null;
var config = null;

var N = require('../nuve');
var nuves = [];

var _ = require('underscore');

var users = {};
var infoOfBoards = {};
var roles = {TEACHER: 'role_teacher', STUDENT: 'role_student'};

collaboration = module.exports = {
    onAuthorizeSuccess: function(data, accept) {
        var refererUrl = data.headers.referer;
        var currentUser = data.user;
        if(refererUrl == undefined) {
            accept('no referer', false);
        } else {
            var boardId = refererUrl.substring(refererUrl.length - 12, refererUrl.length);
            if(infoOfBoards[boardId] == undefined) infoOfBoards[boardId] = {};
            if(infoOfBoards[boardId]['users'] == undefined) infoOfBoards[boardId]['users'] = {};
            if(infoOfBoards[boardId]['boards'] == undefined) infoOfBoards[boardId]['boards'] = {};
            getUserInBoard(boardId, function(err, usersInBoard) {
                if(usersInBoard[currentUser.userId] != undefined) {
                    accept(null, false);
                } else {
                    if(infoOfBoards[boardId]['users'][currentUser.userId] == undefined)
                        infoOfBoards[boardId]['users'][currentUser.userId] = {};
                    accept(null, true);
                }
            });

        }
    },
    onAuthorizeFail: function (data, message, error, accept) {
        if(error)
            throw new Error(message);
        accept(null, false);
    },
    collaborate: function (_io, _config) {
        io = _io;
        config = _config;

        io.sockets.on('connection', function (socket) {
            var user = {};
            user.userId = socket.handshake.user.userId;
            user.name = socket.handshake.user.lastname + " " + socket.handshake.user.firstname;
            user.role = socket.handshake.user.role;

            socket.set('user', user);
            socket.emit('eventConnect', {
                message: 'welcome',
                user: user
            });

            // user joins say hello to all
            socket.on('hello', function (user) {
                var socket = this;
                socket.get('board', function(err, board) {
                    socket.broadcast.to(board).emit('hello',user);
                });
            });

            // user says bye by himself
            socket.on('bye', function () {
                bye(this);
            });

            // disconnected with user
            socket.on('disconnect', function () {
                bye(this);
            });

            socket.on("setUrl", function (boardId, data) {
                var socket = this;
                socket.join(boardId);
                if(infoOfBoards[boardId] == undefined) infoOfBoards[boardId] = {};

                socket.set('board', boardId);
                getUserInBoard(boardId, function(err, usersInBoard) {
                    socket.emit('joined', usersInBoard);
                });

                loadBoards(boardId, socket);
                loadMessages(boardId, socket);

                createToken(boardId, data, socket);

                if(infoOfBoards[boardId]['teacherActiveBoard'] != undefined) {
                    var data = {};
                    data['teacherActiveBoard'] = infoOfBoards[boardId]['teacherActiveBoard'];
                    socket.emit('syncVoice', data);
                }
            });

            socket.on("token", function(boardId, data) {
                createToken(boardId, data, this);
            });

            socket.on('sendMessage', function (boardId, data) {
                sendMessage(boardId, data, this);
            });

            socket.on("loadPdf", function(boardId, data) {
                loadPdf(boardId, data, this);
            });

            socket.on("toggleBoard", function(boardId, data) {
                if(data.status == 'start') {
                    startSession(boardId, data, this);
                } else if(data.status == 'stop') {
                    stopSession(boardId, data, this);
                }
            });

            socket.on("changePage", function(boardId, data) {
                changePage(boardId, data, this);
            });

            socket.on("changeScale", function(boardId, data) {
                changeScale(boardId, data, this);
            });

            socket.on("loadBoard", function (boardId, data) {
                loadBoard(boardId, data, this);
            });

            socket.on("setActive", function (boardId, data) {
                setActiveBoard(boardId, data, this);
            });

            socket.on("createTab", function (boardId, data) {
                createTab(boardId, data, this);
            });

            socket.on("removeTab", function (boardId, data) {
                removeTab(boardId, data, this);
            });

            socket.on("setContainer", function (boardId, data) {
                setContainer(boardId, data);
            });

            socket.on('eventDraw', function (boardId, data) {
                drawOnBoard(boardId, data, this);
            });

            socket.on('setBackground', function(boardId, data) {
                setBackground(boardId, data, this);
            });

            socket.on('mousePointClick', function (boardId, data) {
                socket.broadcast.to(boardId).emit('mousePointClick', data);

            });

            socket.on('mousePointStart', function(boardId, data) {
                socket.broadcast.to(boardId).emit('mousePointStart', data);
            });

            socket.on('mousePointMove', function(boardId, data) {
                socket.broadcast.to(boardId).emit('mousePointMove', data);
            });

            socket.on('syncBoard', function(boardId) {
                syncBoard(boardId, this);
            });

            socket.on('setBoard', function(boardId, data) {
                setBoard(boardId, data, this);
            });
            socket.on('toggleSync', function(boardId, data) {
                toggleSync(boardId, data, this);
            });

            socket.on('user-actions', function(boardId, data) {
                this.broadcast.to(boardId).emit('user-actions', data);
            });

            socket.on('viewport', function(boardId, data) {
                this.broadcast.to(boardId).emit('viewport', data);
            });

            socket.on('kickUser', function(boardId, data) {
                this.broadcast.to(boardId).emit('viewport', data);
                kickUser(boardId, data, this);
            });
			socket.on('toggleAudio', function(boardId, data) {
				this.broadcast.to(boardId).emit('toggleAudio', boardId, data);
			});
			socket.on('raiseHand', function(boardId, data){
				this.broadcast.to(boardId).emit('raiseHand', boardId, data);
			});
        });
    }
}



var loadBoards = function(boardId, socket) {
    var data = {};

    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("loadBoards load board error:" + err);
        } else {
            var parent = board.allProperties();
            data['parent'] = parent;

            infoOfBoards[boardId]['boards'][boardId] = parent;


            if(parent['sessionStatus'] == 1) {
                var currentTotalTime = parseInt(parent['totalTime']);
                var now = new Date().getTime();
                parent['totalTime'] = (now - parent['timeStarted']) / 1000 + currentTotalTime;
            }

            if(parent['sessionStatus'] == 0) {
                var now = new Date().getTime();
                parent['totalTime'] = parent['sessionPlanStart'] > now ? (parent['sessionPlanStart']-now)/1000 : 0;
            }

            socket.get('user', function(err, user) {
                var sync = parseInt(parent['sync']);
                if(sync) {
                    infoOfBoards[boardId]['users'][user.userId]['active'] = parent['active'];

                } else {
                    if(infoOfBoards[boardId]['users'][user.userId]['active'] != undefined){
                        parent['active'] = infoOfBoards[boardId]['users'][user.userId]['active'];
                    }

                    if(infoOfBoards[boardId]['boards'][data.boardId] != undefined) {
                        parent['docPage'] = infoOfBoards[boardId]['boards'][data.boardId]['docPage'];
                        parent['docScale'] = infoOfBoards[boardId]['boards'][data.boardId]['docScale'];
                    }
                }
            });

            data['children'] = [];

            BoardModel.findAndLoad({parentId: parent['boardId']}, function(err, children) {
                if(err) {
                } else {
                    children.forEach(function(child) {

                        // consider if this user can join this board child
                        var students = child.p('students');
                        var childId = child.p('boardId');

                        data['children'].push(child.allProperties());

                        infoOfBoards[boardId]['boards'][childId] = child.allProperties();
                    });
                }
                socket.emit('containerDraw', data);
            });
        }
    });
};

var loadBoard = function(boardId, data, socket) {
    if(typeof(boardId) == 'undefined' || typeof(data.boardId) == 'undefined') {
        return;
    }

    if(typeof(data.page) == "undefined") {
        data.page = 1;
    }

    ShapesModel.findAndLoad({boardId: data.boardId, page: data.page}, function (err, shapes) {
        if (!err) {
            shapes.forEach(function(shape) {
                var props = shape.allProperties();
                socket.emit('eventDraw', eval({
                    boardId: props.boardId,
                    palette: props.palette,
                    action: props.action,
                    args: [props.args]
                }));
            });
        }
    });
};

var setBoard = function(boardId, data, socket) {
    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("setBoard load board error:" + err);
        } else {
            board.p('name', data.boardName);
            board.p('students', data.students);
            board.save();

            socket.broadcast.to(boardId).emit('setBoard', data);
            syncVoice(boardId, socket);
        }
    });
}

var toggleSync = function(boardId, data, socket) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("toggleSync load board error:" + err);
        } else {
            var sync = parseInt(data.sync);
            board.p('sync', sync);

            if(sync) {
                board.p('active', data.active);
                _(infoOfBoards[boardId]['users']).each(function(userInfo) {
                    userInfo['active']  = data.active;
                });
            }

            infoOfBoards[boardId]['boards'][boardId] = board.allProperties();
            board.save();
            socket.broadcast.to(boardId).emit('toggleSync', data);
            syncVoice(boardId, socket);
        }
    });
};

var syncVoice = function(boardId, socket) {
    socket.get('user', function(err, user) {
        // we only send this event if teacher has done some changes
        if(user.role == 'role_teacher') {
            var data = {};
            infoOfBoards[boardId]['teacherActiveBoard'] = infoOfBoards[boardId]['users'][user.userId]['active'];
            data['teacherActiveBoard'] = infoOfBoards[boardId]['teacherActiveBoard'];
            socket.broadcast.to(boardId).emit('syncVoice', data);
        }
    });

}

var syncBoard = function(boardId, socket) {
    if(typeof(boardId) == 'undefined') {
        return;
    }
    var data = {};

    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("loadBoards:" + err);
        } else {
            var data = board.allProperties();
            socket.emit('syncBoard', data);
        }
    });
};

var loadMessages = function(boardId, socket) {
    if(typeof(boardId) == 'undefined') {
        return;
    }
    MessageModel.findAndLoad({boardId: boardId}, function(err, messages) {
        if(!err) {
            messages.forEach(function(message) {
                var props = message.allProperties();
                socket.emit('sendMessage', eval({
                    boardId: props.boardId,
                    createdBy: props.createdBy,
                    message: props.message,
                    createdTime: props.createdTime,
                }));
            });
        }
    });
};

var sendMessage = function(boardId, data, socket) {
    if(typeof(boardId) == 'undefined' || typeof(data.createdBy) == 'undefined' || typeof(data.message) == 'undefined') {
        return;
    }

    data.boardId = boardId;
    data.createdTime = new Date().getTime();
    var message = new MessageModel();
    message.store(data, function(err) {
        if(err) {
            logger.error("sendMessage::store::error:" + err);
        } else {
            socket.broadcast.to(boardId).emit('sendMessage', data);
        }
    });
};

var setContainer = function (boardId, data) {
    BoardModel.find({boardId: boardId},function (err, ids) {
        if (err) {
            logger.error("setContainer load board error:" + err);
        } else {
            ids.forEach(function (id) {
                var board = new BoardModel();
                board.load(id, function (err, props) {
                    if (err) {
                        return next(err);
                    } else {
                        props.container = data.containerName;
                        props.canvasWidth = data.canvasWidth;
                        props.canvasHeight = data.canvasHeight;
                        board.store(props, function (err) {
                            logger.debug("Added container to your board successfully!");
                            if(err)
                            {
                                logger.error("setContainer update board error, boardId:"+boardId+"::error:"+err);
                            }
                        });
                    }
                });
            });
        }
    });
};

var drawOnBoard = function (boardId, data, socket) {
    if (typeof(boardId) == 'undefined' || typeof(data.boardId) == 'undefined'
        || typeof(data.args[0]) == 'undefined'  || typeof(data.args[0].uid) == 'undefined'
        || data.action === "clearText") {
        return;
    }

    if(typeof(data.page) == "undefined") {
        data.page = 1;
    }

    socket.broadcast.to(boardId).emit('eventDraw', data);

    data.args = data.args[0];
    data.shapeId = data.args.uid;

    var shape = new ShapesModel();

    if(data.action == 'image' && data.args.latex == undefined) {
        var file = data.args.src;
        addFileToBoard(boardId, file);
    }

    if (data.action == "modified" || data.action == "zindexchange") {
        var old_obj = data.args;

        data.args = data.args.object;

        shape.loadByShapeId(
            data.shapeId,
            function(err, props) {
               if(!err) {
                   if(props.args.name)
                    data.args.name = props.args.name;
                   if(props.shapeId)
                    data.args.uid = props.shapeId;
                   if(props.palette)
                    data.args.palette = props.palette;
                   if(props.palette)
                    data.palette = props.palette;
                   if(props.action)
                    data.action = props.action;
                   if(old_obj.latex){
                       data.args.latex = old_obj.latex;
                   }
                   if(old_obj.showEditIcon){
                       data.args.showEditIcon = old_obj.showEditIcon;
                   }
                   shape.store(data, function(err){
                        if(err) logger.error("drawOnBoard update shape error:" + err)
                   });
               }
            });
    } else if (data.action == "delete") {
        shape.loadByShapeId(
            data.shapeId,
            function(err, props) {
                if(!err) {
                    shape.delete(data, function(err){
                        if(err) logger.error("drawOnBoard delete shape error:" + err)
                    });
                }
            }
        );
    } else {
        shape.store(data, function(err){
            if(err) {
                logger.error("drawOnBoard::createShape::" + err);
            }
        });
    }
};

var createTab = function(boardId, data, socket) {

    var clients = io.sockets.clients(boardId);

    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("createTab load board error:" + err);
        } else {
            infoOfBoards[boardId]['boards'][data.boardId] = board.allProperties();
        }
    });
    socket.broadcast.to(boardId).emit('createTab', data);
};

var removeTab = function(boardId, data, socket) {
    socket.broadcast.to(boardId).emit('removeTab', data);

    // TODO: Need to update active board for this user in infoOfBoards

    delete infoOfBoards[boardId]['boards'][data.boardId];
};

var setBackground = function (boardId, data, socket) {
    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("setBackground load board error:" + err);
        } else {
            board.p('background', data.background);
            board.save();
            socket.broadcast.to(boardId).emit('background', data);

        }
    });
};

var setActiveBoard = function(boardId, data, socket) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("setActiveBoard load board error:" + err);
        } else {
            var sync = parseInt(board.p('sync'));
            if(sync) {
                _(infoOfBoards[boardId]['users']).each(function(value, userId) {
                    infoOfBoards[boardId]['users'][userId]['active'] = data.boardId;
                });
                board.p('active', data.boardId);
                board.save();
            } else {
                socket.get('user', function(err, user) {
                    infoOfBoards[boardId]['users'][user.userId]['active'] = data.boardId;
                });
            }
            socket.broadcast.to(boardId).emit('setActive', data);
            syncVoice(boardId, socket);
        }
    });
};

var loadPdf = function(boardId, data, socket) {
    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("loadPdf load board error:" + err);
        } else {
            data.docPage = data.docPage ? data.docPage : 1;
            data.docScale = data.docScale ? data.docScale : 1;
            board.p('docPage', data.docPage);
            board.p('docUrl', data.docUrl);
            board.p('docScale', data.docScale);
	        board.save();
            addFileToBoard(boardId, data.docUrl);
            socket.broadcast.to(boardId).emit('loadPdf', data);
        }
    });
};

var addFileToBoard = function(boardId, file) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("addFileToBoard load board error:" + err);
        } else {
            var files = board.p('files');
            if(_(files).isEmpty()) files = [];
            if(!_(files).contains(file)){
                files.push(file);
                board.p('files', files);
            }
            board.save();
        }
    });
}

var changePage = function(boardId, data, socket) {
    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("changePage load board error:" + err);
        } else {
            board.p('docPage', data.docPage);
            board.save();
            socket.broadcast.to(boardId).emit('changePage', data);
            infoOfBoards[boardId]['boards'][data.boardId] = board.allProperties();
        }
    });
};

var changeScale = function(boardId, data, socket) {
    BoardModel.loadByBoardId(data.boardId, function(err, board) {
        if(err) {
            logger.error("changePage load board error:" + err);
        } else {
            board.p('docScale', data.docScale);
            board.save();
            socket.broadcast.to(boardId).emit('changeScale', data);
            infoOfBoards[boardId]['boards'][data.boardId] = board.allProperties();
        }
    });
};

var bye = function(socket) {
    socket.get('user', function(err, user) {
        socket.get('board', function(err, boardId) {
            socket.broadcast.to(boardId).emit('bye',user);
            socket.leave(boardId);
            var clients = io.sockets.clients(boardId);
            if(clients.length == 0) {
                stopSession(boardId, {status: 'stop'}, socket);
            }
        });
    });
};

var startSession = function(boardId, data, socket) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("startSession load board error:" + err);
        } else {
            var sessionStatus = board.p('sessionStatus');
            if(sessionStatus == 0 || sessionStatus == 2) {
                board.p('sessionStatus', 1);
                board.p('timeStarted', new Date().getTime());
                board.save();
                SessionHandle.startSession(board.p('sessionId'));
                socket.broadcast.to(boardId).emit('toggleBoard', data);
            }
        }
    });
}

var stopSession = function(boardId, data, socket) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("stopSession load board error:" + err);
        } else {
            if(board.p('sessionStatus') == 1){
                var timeStopped = new Date().getTime();

                var currentTotalTime = parseInt(board.p('totalTime'));
                var totalTime = (timeStopped - board.p('timeStarted')) / 1000 + currentTotalTime;

                board.p('totalTime',totalTime);
                board.p('sessionStatus', 2);
                board.p('timeStopped', timeStopped);

                board.save();
                SessionHandle.endSession(board.p('sessionId'), board.p('totalTime') / 60);
                socket.broadcast.to(boardId).emit('toggleBoard', data);

                sendFeedback(boardId, board.p('sessionId'));
            }
        }
    });
}

var sendFeedback = function(boardId, sessionId) {
    SessionHandle.getFeedbackUrls(sessionId, function(err, result) {
        if(!err) {
            var sockets = io.sockets.clients(boardId);
            _(sockets).each(function(socket) {
                socket.get('user', function(err, user) {
                    if(user.role == roles.STUDENT) {
                        socket.emit('feedback', {'form_url': result.student_form_url});
                    } else if(user.role == roles.TEACHER) {
                        socket.emit('feedback', {'form_url': result.teacher_form_url});
                    }
                })
            });
        }
    });
}

var createToken = function(boardId, data, socket) {
    async.waterfall([
        function(callback) {
            if(config['media'])callback(null)
            else callback('no media');
        },
        function(callback) {
            BoardModel.loadByBoardId(boardId, function(err, board) {
                if(err) {
                    logger.error("createToken load board error:" + err);
                    callback(err);
                } else {
                    var roomId = board.p('roomId');
                    var nuveId = board.p('nuve') ? board.p('nuve') : 0;
                    var nuve = config.nuves[nuveId] ? config.nuves[nuveId] : config.nuves[0];
                    N.API.init(nuve.serviceId, nuve.serviceKey, nuve.host);
                    if(roomId == "") {
                        var p2p = board.p('p2p') == 1 ? true : false;
                        N.API.createRoom('myRoom', function (roomID) {
                            var roomId = roomID._id;
                            board.p('roomId', roomId);
                            board.save(function (err) {
                                if (err) {
                                    logger.error('Creating Licode Room Error for Board: ' + boardId + ", err:" + err);
                                    callback('save room error');
                                } else {
                                    callback(null, roomId);
                                }
                            });
                        }, function() {callback('create room error')}, {p2p: p2p});
                    } else {
                        callback(null, roomId);
                    }
                }
            });
        },
        function(roomId, callback) {
            socket.get('user', function(err, user) {
                N.API.createToken(roomId, user.userId, "presenter", function (token) {
                    callback(null, token);
                }, function(err) {
                    logger.error("create token error: "+err);
                    callback('create token error');
                });
            });
        },
    ], function (err, token) {
        if(token == undefined) token = "";
        socket.emit('token', token);
    });
}

var getUserInBoard = function(boardId, callback) {
    var usersInBoard = {};
    var clients = io.sockets.clients(boardId);
    async.each(clients, function(client, cb) {
        client.get('user', function(err, user) {
            usersInBoard[user.userId] = user;
            cb(null);
        });
    }, function(err) {
        callback(err, usersInBoard);
    });

}

var kickUser = function(boardId, data, socket) {
    BoardModel.loadByBoardId(boardId, function(err, board) {
        if(err) {
            logger.error("kickUser load board error:" + err);
        } else {
            var users = board.p('users');
            if(_(users).has(data.userId)) {
                delete users[data.userId];
                board.p('users', users);
                board.save();

                SessionHandle.kickUser(board.p('sessionId'), data.userId);

                var clients = io.sockets.clients(boardId);
                _(clients).each(function(client) {
                    client.get('user', function(err, user) {
                        if(user.userId == data.userId) {
                            client.emit('kickUser');
                        }
                    })
                });
            }
        }
    });
}
