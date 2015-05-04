define(["storm", "features/list-users","storm.util", "underscore", "erizo"], function (storm, listUsers, util, _) {
    var speaking = false, audioStream, videoStream, room, retry, teacherActiveBoard, syncTimeout, DISCONNECTED=0, CONNECTING=1, CONNECTED=2;
    var licode = {
        init: function() {
            storm.comm.socket.on('token', function(token) {
                if(token != "") {
                    licode.start(token);
                }
            });

            storm.comm.socket.on('syncVoice', function(data) {
                licode.syncVoice(data);
            });
            
            storm.comm.socket.on('changeSpeakingStudent', function(data){
                if ($('#button_mic').hasClass('board-icon-micro-on')) {
                    licode.publishAudio(false);
                }
                else if (storm.user.userId === data.userId){
                
                    if ($('#button_mic').hasClass('board-icon-micro-off')){
                        licode.publishAudio(true);
                        
                    }
                }
                listUsers.setGioTayStatus(data.userId,'');
            });

            bindButtons();
        },
        start: function(token) {
            if(room != undefined) {
                if(retry != undefined)  {
                    clearInterval(retry);
                    retry = undefined;
                };
                storm.ui.hideDisconnecting();
                return;
            }
            room = Erizo.Room({token: token});

            room.connect();

            room.addEventListener("room-connected", function (roomEvent) {
                setWebcamStatus('off');
                setMicroStatus('off');

                // Auto subscribe only if student or teacher
                if(storm.user.isTeacher()) {
                    licode.publishAudio(true);
                }

                _(roomEvent.streams).each(function(stream) {
                    subscribeToStream(stream);
                });
            });

            room.addEventListener("room-disconnected", function (roomEvent) {
                setMicroStatus('disabled');
                setWebcamStatus('disabled');
                room = undefined;
                audioStream = undefined;
                videoStream = undefined;

                setTimeout(storm.ui.showMediaDisconnecting, 500);

                retry = setInterval(function() {
                    storm.comm.socket.emit("token", storm.parentBoardId, {});
                }, 1000);

            });

            room.addEventListener("stream-subscribed", function(streamEvent) {
                var stream = streamEvent.stream;
                if(stream.hasVideo()) {
                    $('#video').append("<div class='video' id='subscriber-"+stream.getID()+"'></div>");
                    var name = stream.getAttributes().name;
                    stream.show("subscriber-" + stream.getID(), {speaker: false, name: name});
                    resizeLayout( {container: "#video", element: ".video"} );
                } else if(stream.hasAudio()){
                    stream.state = CONNECTED;
                    $('#video').append("<div class='audio' id='subscriber-"+stream.getID()+"'></div>");
                    stream.show("subscriber-" + stream.getID(), {speaker: false});
                    var userId = stream.getAttributes().userId;
                    listUsers.setMicroStatus(userId, 'speaking');
                }

            });

            room.addEventListener("stream-added", function (streamEvent) {
                var stream = streamEvent.stream;
                subscribeToStream(stream);
            });

            room.addEventListener("stream-removed", function (streamEvent) {
                // Remove stream from DOM
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                    $('#'+stream.elementID).remove();
                    resizeLayout( {container: "#video", element: ".video"} );
                    if(stream.hasAudio()) {
                        var userId = stream.getAttributes().userId;
                        listUsers.setMicroStatus(userId, '');
                    }
                }
            });
        },

        stop: function() {
            if(audioStream != undefined) {
                audioStream.close();
            }

            if(videoStream != undefined) {
                videoStream.close();
            }

            if(room != undefined) {
                room.disconnect();
            }
        },

        publishAudio: function(status) {
           
            if(status == true && audioStream == undefined) {
                audioStream = Erizo.Stream({audio: true, video: false, attributes: {userId: storm.user.userId}});
                audioStream.init();
                setMicroStatus('loading');
                audioStream.addEventListener("access-accepted", function () {
                    room.publish(audioStream, {}, function(){
                        console.log("published audio stream")
                    }, function(anwser) {
                        console.log("Failed to publish audio stream, anwser: " + anwser);
                    });
                });

                audioStream.addEventListener('access-denied', function(event) {
                    setMicroStatus('disabled');
                });
            } else {
                if(audioStream != undefined) {
                    audioStream.close();
                    audioStream = undefined;
                    setMicroStatus('off');
                }
            }
        },
        publishVideo: function(status) {
            if(status == true && videoStream == undefined) {
                videoStream = Erizo.Stream({audio: false, video: true, attributes: {name: storm.user.name}});
                videoStream.init();
                setWebcamStatus('loading');

                videoStream.addEventListener('access-accepted', function(event) {
                    room.publish(videoStream, {}, function(){
                        console.log("published video stream");
                    }, function(anwser) {
                        console.log("Failed to publish video stream, anwser: " + anwser);
                    });
                    $('#webcam .publisher').append('<div id="publisher"></div>');
                    videoStream.show("publisher", {speaker: false});
                });

                videoStream.addEventListener('access-denied', function(event) {
                    setWebcamStatus('disabled');
                });
            } else {
                if(videoStream != undefined) {
                    videoStream.close();
                    videoStream = undefined;
                    $("#publisher").remove();
                    setWebcamStatus('off');
                }
            }

        },

        syncVoice: function(data) {
            teacherActiveBoard = data.teacherActiveBoard;
            if(room != undefined) {
                if(syncTimeout) {
                    clearTimeout(syncTimeout);
                }
                syncTimeout = setTimeout(function() {
                    _(room.remoteStreams).each(function(stream) {
                        subscribeToStream(stream);
                    });
                    syncTimeout = undefined;
                }, 1000);
            }
        },
    };

    function subscribeToStream(stream) {
        if(audioStream != undefined && audioStream.getID() == stream.getID()) {
            setMicroStatus('on');
        } else if(videoStream != undefined && videoStream.getID() == stream.getID()) {
            setWebcamStatus('on');
        } else {
            if(stream.hasAudio()) {

                var remoteUserId =  stream.getAttributes().userId;
                var remoteUser = storm.users[remoteUserId];
                if(stream.state == undefined || stream.state == DISCONNECTED) {
                    listUsers.setMicroStatus(remoteUserId, 'on-small');
                }

                var currentUser = storm.user;
                var currentUserId = currentUser.userId;

                /* we will subscribe if:
                    1: If the session is synced
                    2: This current users is not student
                    3: If this current user is student, the remote user must be a teacher, and that user is on shared board, or a board assigned for this user
                */

                if(storm.sync) {
                    subscribe(stream);
                } else if(currentUser.role != storm.roles.STUDENT) {
                    subscribe(stream);
                } else if(remoteUser && remoteUser.role == storm.roles.TEACHER) {
                    if(!teacherActiveBoard) teacherActiveBoard = storm.parentBoardId;
                    var studentOnTeacherBoard = storm.dataBoards[teacherActiveBoard].students;
                    if(_(studentOnTeacherBoard).isEmpty() || _(studentOnTeacherBoard).contains(currentUserId)) {
                        subscribe(stream);
                    } else {
                        unsubscribe(stream);
                    }
                }
                else {
                    unsubscribe(stream);
                }

            } else if(stream.hasVideo()) {
                // We don't care about video now, anyone can subscribe
                room.subscribe(stream);
            }
        }
    };

    function subscribe(stream) {
        if(stream.state == undefined || stream.state == DISCONNECTED) {
            room.subscribe(stream);
            stream.state = CONNECTING;
            console.log('subscribed stream from user: ' + stream.getAttributes().userId);
            if(stream.hasAudio()) {
                var userId =  stream.getAttributes().userId;
                listUsers.setMicroStatus(userId, 'loading-small');
            }
        }
    }

    function unsubscribe(stream) {
        if(stream.state != undefined && stream.state == CONNECTED) {
            var remoteUserId = stream.getAttributes().userId;
            room.unsubscribe(stream);
            stream.hide();
            // Close PC stream
            stream.pc.close();
            stream.state = DISCONNECTED;
            console.log('unsubscribed stream from user: ' + remoteUserId);
            if(stream.hasAudio()) {
                var userId =  stream.getAttributes().userId;
                listUsers.setMicroStatus(userId, 'on-small');
            }
        }
    }

    function bindButtons() {
        $("#friendsicon .list-user").on("change", "input[type=range]", function(){
            var userId = $(this).parent().attr('id').substring(4);
            if(room != undefined) {
                var volume =$(this).val() / 100;
                var stream = room.getStreamsByAttribute('userId', userId)[0];
                stream.player.audio.volume = volume;
            }

        });

        $('#button_webcam').click(function(event) {
            if($(this).hasClass('board-icon-webcam-on')) {
                licode.publishVideo(false);
            }else if($(this).hasClass('board-icon-webcam-off')){
                licode.publishVideo(true);
            }
        });

        $('#button_mic').click(function(event) {
            //console.log(util.getMode());
            if(util.getMode()==='1'){
                if(storm.user.isStudent()) return ;
            }
            if($(this).hasClass('board-icon-micro-on')) {
                licode.publishAudio(false);
            } else if($(this).hasClass('board-icon-micro-off')){
                licode.publishAudio(true);
            }
        });

        $('#label_button_webcam').click(function(event) {$('#button_webcam').click();});

        $('#label_button_mic').click(function(event) {$('#button_mic').click();});
    };

    function setWebcamStatus(status) {
        $('#button_webcam').attr( "class", 'board-icon-webcam-'+status );
    }

    function setMicroStatus(status) {
         $('#button_mic').attr( "class", 'board-icon-micro-'+status );
    }

    function resizeLayout(params) {
        var cols, eHeight, eWidth, element, height, nHeight, nWidth, parent, parent$, rows, spacing, testHeight, testWidth, videoCount, width;
        params = params ? params : {};
        parent = params.container ? params.container : "#video";
        element = params.element ? params.element : ".video";
        parent$ = $(parent);
        parent$.css({'padding-top': "0"});
        videoCount = parent$.find(element).length;
        width = parent$.innerWidth();
        height = parent$.innerHeight();
        switch (videoCount) {
            case 0: rows = 1; cols = 1; break;
            case 1: rows = 1; cols = 1; break;
            case 2: rows = 1; cols = 2; break;
            case 3: rows = 2; cols = 2; break;
            case 4: rows = 2; cols = 2; break;
            default:
                rows = Math.ceil(videoCount/3); cols = 3;
                var newHeight = width*rows/4;
                if(newHeight > height) {
                  $(parent).height(width*rows/4);
                }
                break;
        }

        eWidth = Math.floor(width / cols);
        return parent$.find(element).each(function(k, e) {
            $(e).width(eWidth);
            return $(e).height(eWidth * 3 / 4);
        });
    }

    return licode;
});