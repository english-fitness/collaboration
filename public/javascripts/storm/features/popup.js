define(["storm"], function(storm) {
    var popup = {
        init: function() {
            if($.cookie('welcome-message') == undefined) $.cookie('welcome-message', 0);

            storm.comm.socket.on('feedback', function (data) {
                popup.showFeedback(data);
            });
			
            bindEvents();
        },

        showWelcome: function() {
            var count = $.cookie('welcome-message');
            if(count < 2) {
                $('#welcome').modal('show');
                count++;
                $.cookie('welcome-message', count);
            }
        },

        showFeedback: function(data) {
            if(data.form_url) {
                var url = data.form_url;
                var users = storm.dataBoards[storm.parentBoardId].users;
                _(users).each(function(user){
                    if(user.role == storm.roles.TEACHER){
                        url = url.replace("teacher_name",user.name);
                        return false;
                    }
                });
                if(storm.user.role == storm.roles.STUDENT) {
                    url = url.replace("student_name",storm.user.name);
                }

                url = url.replace("session_id",storm.dataBoards[storm.parentBoardId].sessionId);
                $('#feedbackIF').attr('src',url);
                $('#feedback').modal({keyboard: false, backdrop: 'static'});
                $('#feedback').modal('show');
            }
        },

        showHelp: function() {
            $('#welcome').modal('show');
        }
    };

    function bindEvents() {
        $('#help .board-icon-help').click(function() {
            popup.showHelp();
        });
    }

    return popup;
});