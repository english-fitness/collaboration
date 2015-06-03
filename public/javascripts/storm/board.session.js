define(["storm", "storm.palettes", "board.sync"], function(storm, palettes, boardSync) {
    var timeSpent = 0;
    var boardSession = {
        init: function() {
            storm.comm.socket.on('toggleBoard', function (data) {
                if(data.status == 'start') {
                    startSession();
                }else if(data.status == 'stop') {
                    endSession();
                }
            });

            bindEvents();
        },

        setTime: function() {
            var parent = storm.dataBoards[storm.parentBoardId];
            var totalTime = parseInt(parent['totalTime']);
            var sessionStatus = parent['sessionStatus'];
            var sessionType = parent['sessionType'];

            if (sessionType == 0) {
                // this session for testing only
                $('#start-stop-calc-time').addClass('disabled');
            } else if (sessionStatus == 0) {
                var user = storm.user;
                if(user.role == storm.roles.STUDENT) {
                    palettes.turnOffPalettes();
                    disableBoard();
                } else {
                    // for other users, always enable the board
                    enableBoard();
                }
                if(totalTime > 0) {
                    startTimerClass(totalTime, -1);
                } else {
                    disableBoard();
                }
            } else if (sessionStatus == 1) {
                // this session is happening
                startTimerClass(totalTime, 1);
                enableBoard();

            } else if (sessionStatus == 2) {
                // this session ended
                startTimerClass(totalTime, 0);
                endSession();
            }

            storm.sessionStatus = sessionStatus;
        }
    };

    function bindEvents() {
        $('#start-stop-calc-time').on('click',function(e) {
            e.preventDefault();

            if(storm.user.role == storm.roles.STUDENT) {
                return;
            }

            if(!$(this).hasClass('disabled')) {
                if($(this).hasClass('stoped')) {
                    if(_.size(storm.teachers) > 0 && _.size(storm.students) > 0) {
                        sendToggleBoard({status:'start'});
                        startSession();
                    }else{
                        alert('There must be at least on teacher and one student in order to start the class!');
                    }
                } else {
                    if(confirm('Are you sure you want to end the class?')) {
                        sendToggleBoard({status:'stop', forceEnd:true});
                        endSession();
                    }
                }
            }
        });
    }

    function toggleBoard() {
        var objEffect = $('#start-stop-calc-time');
        if(!objEffect.hasClass('disabled')){
            if(objEffect.hasClass('stoped')){
                sendToggleBoard({status:'start'});
                startSession();
            }else{
                sendToggleBoard({status:'stop'});
                endSession();
            }
        }
    }

    function startSession() {
        var objEffect = $('#start-stop-calc-time');
        objEffect.removeClass('stoped').addClass('started');
        objEffect.find('i').removeClass('board-icon-play').addClass('board-icon-pause');
        objEffect.find('span.status-text').html('Kết thúc');
        enableBoard();
        startTimerClass(timeSpent, 1);
        palettes.turnOnPalettes();
        storm.sessionStatus = 1;
        storm.enableDraw = true;

        if(!storm.sync) {
            boardSync.toggleSync(1);
        }
    }

    function endSession() {
        var objEffect = $('#start-stop-calc-time');
        objEffect.removeClass('started').addClass('stoped');
        objEffect.find('i').removeClass('board-icon-pause').addClass('board-icon-play');
        objEffect.find('span.status-text').html('Continue');
        stopTimerClass();
        // disableBoard();
        palettes.turnOffPalettes();
        storm.sessionStatus = 2;
        storm.enableDraw = false;

        if(storm.sync) {
            boardSync.toggleSync(0);
        }
        timeSpent = parseInt($('#time_second').text()) + parseInt($('#time_minutes').text())*60 + parseInt($('#time_hours').text())*3600;
    }

    function disableBoard() {
        if($('body').find('.board-disabled').length == 0){
            if(storm.user.role == storm.roles.STUDENT){
                $('body').append('<div class="board-disabled"><div class="alert-start">Waiting for teacher to start the class<br/> If you have problem using the board, audio or video... <br> Please  <span style="color: red;">reload</span> reload the browser <span style="color: red;">(Press F5)</span> to try again</div></div>');
            }else{
                $('body').append('<div class="board-disabled"><div class="alert-start">Press \“Start\” or \“Continue\” to start the class</div></div>');
            }
        }
    }

    function enableBoard() {
        $('body .board-disabled').remove();
    }

    function startTimerClass(seconds,starting){
        var sec_num = parseInt(seconds, 10);
        var starting = parseInt(starting);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var second = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (second < 10) {second = "0"+second;}
        $('#time_second').text(second);
        $('#time_minutes').text(minutes);
        $('#time_hours').text(hours);


        if(starting !=0){
            clearTimeout(storm.myTimer);
            storm.timer_started = true;

            if(starting > 0) {
                var timmerHtml = $('#start-stop-calc-time');
                timmerHtml.removeClass('stoped').addClass('started');
                timmerHtml.find('i').removeClass('board-icon-play').addClass('board-icon-pause');
                timmerHtml.find('span.status-text').html('End');
            }

            storm.myTimer = setInterval(function(){
                var hours = parseInt($('#time_hours').text());
                var minutes = parseInt($('#time_minutes').text());
                var seconds = parseInt($('#time_second').text());
                starting > 0 ? seconds++ : seconds--;
                if(seconds == 60){
                    seconds = '00';
                    minutes++;
                } else if(seconds < 0) {
                    seconds = '59';
                    minutes--;
                } else if(seconds < 10){
                    seconds = '0' + seconds;
                }


                if(minutes == 60){
                    minutes = '00';
                    hours++;
                } else if(minutes < 0) {
                    minutes = '59';
                    hours--;
                } else if(minutes < 10){
                    minutes = '0' + minutes;
                }
                if(hours < 0) {
                    seconds = '00';
                    minutes = '00';
                    hours = '00';
                    clearTimeout(storm.myTimer);
                    disableBoard();
                } else if(hours < 10){
                    hours = '0' + hours;
                }
                $('#time_second').text(seconds);
                $('#time_minutes').text(minutes);
                $('#time_hours').text(hours);
            },1000);
        }
    }

    function stopTimerClass(){
        storm.timer_started = false;
        clearInterval(storm.myTimer);
    }

    function sendToggleBoard(data) {
        storm.comm.socket.emit("toggleBoard", storm.parentBoardId, data);
    }

    return boardSession;
});