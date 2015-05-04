define(["storm", "features/chat","features/list-users","storm.util"], function(storm, chat,listUsers,util ) {
    function init() {
        storm.comm.socket.on('user-actions', function(data) {
            if(data.action == 'thumb-up') {
                setUserThumbStatus(data.userId, 'up');
            } else if(data.action == 'thumb-down') {
                setUserThumbStatus(data.userId, 'down');
            }
        });
        storm.comm.socket.on('raiseHand', function(data) {
            listUsers.setGioTayStatus(data.userId, data.status);
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
        
        $('#button_thumb_raisehand').click(function(event) {
            console.log('Da bam nut gio tay');
            console.log(util.getMode());
            if(util.getMode()==='2'){
                return ;
            }
            storm.comm.socket.emit('raiseHand', storm.parentBoardId, {userId:storm.user.userId});
            if ($('#user'+storm.user.userId+' div .raisehand').attr('class')=== 'raisehand'){
                storm.comm.socket.emit('raiseHand', storm.parentBoardId, {userId:storm.user.userId, status:'raising'});
                listUsers.setGioTayStatus(storm.user.userId,'raising');
            }else{
                storm.comm.socket.emit('raiseHand', storm.parentBoardId, {userId:storm.user.userId, status:''});
                listUsers.setGioTayStatus(storm.user.userId,'');
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