define(["storm", "features/chat"], function(storm, chat) {
    function init() {
        storm.comm.socket.on('user-actions', function(data) {
            if(data.action == 'thumb-up') {
                setUserThumbStatus(data.userId, 'up');
            } else if(data.action == 'thumb-down') {
                setUserThumbStatus(data.userId, 'down');
            }
        });

        bindButtons();
    }

    function bindButtons() {
        $('#button_thumb_up').click(function(event) {
            if(getThumbUpStatus() == 'ready') {
                setThumbUpStatus('active');
                setThumbDownStatus('disabled');
                setTimeout(resetThumbButtons, 3000);
                storm.comm.socket.emit('user-actions', storm.parentBoardId, {action: 'thumb-up', userId: storm.user.userId});
                chat.sendMessage('(y)');
            }
        });

        $('#button_thumb_down').click(function(event) {
            if(getThumbDownStatus() == 'ready') {
                setThumbUpStatus('disabled');
                setThumbDownStatus('active');
                setTimeout(resetThumbButtons, 3000);
                storm.comm.socket.emit('user-actions', storm.parentBoardId, {action: 'thumb-down', userId: storm.user.userId});
                chat.sendMessage('(n)');
            }
        });
    }

    function setUserThumbStatus(userId, status) {
        var element = '<div class="thumb board-icon-thumb-'+status+'-active"></div>';
        $('#user'+userId+" .action").prepend(element);
        setTimeout(function(){
            $('#user'+userId+" .action .thumb").remove();
        }, 3000);
    }

    function resetThumbButtons() {
        setThumbUpStatus('ready');
        setThumbDownStatus('ready');
    }

    function getThumbUpStatus() {
        var status = $('#button_thumb_up').attr("class");
        if(status != undefined && status.indexOf('board-icon-thumb-up-') > -1) {
            return status.substring(20);
        } else {
            return '';
        }
    }

    function setThumbUpStatus(status) {
        $('#button_thumb_up').attr("class", 'board-icon-thumb-up-'+status);
    }

    function getThumbDownStatus() {
        var status = $('#button_thumb_down').attr("class");
        if(status != undefined && status.indexOf('board-icon-thumb-down-') > -1) {
            return status.substring(22);
        } else {
            return '';
        }
    }

    function setThumbDownStatus(status) {
        $('#button_thumb_down').attr("class", 'board-icon-thumb-down-'+status);
    }

    return {init: init};
});