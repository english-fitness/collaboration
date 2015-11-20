define(["storm", "storm.util", "boards"], function(storm, util, boards) {
	var boardSync = {
		init: function() {

			storm.comm.socket.on('toggleSync', function (data) {
	            setSyncButton(data.sync);

	            if(data.sync == 1){
	                if(data.active){
	                    boards.setActiveBoard(data.active,false);
	                }
	            } else {
	                if(!util.isAllowBoard(data.boardId)) {
	                    // jump to main board
	                    // $("#boards div#boards-tab ul li:first a.link-board").click();
	                }
	            }
	        });

			bindEvents();
		},

		toggleSync: function(sync) {
			var data = {boardId: storm.currentBoardId, sync: sync, active: storm.currentBoardId};

			setSyncButton(sync);
	        sendToggleSync(data);
		},

		displaySyncButton: function(sync) {
			if($('#boards-tab .sync-whiteboard').length == 0){
                $('#boards-tab').append('<div class="sync-whiteboard"></div>');
            }
            setSyncButton(sync);
		}
	};

	function setSyncButton(sync) {
        sync = parseInt(sync);
        storm.sync = sync ? true: false;
        var button = $("#boards-tab .sync-whiteboard");
        button.removeClass('sync').removeClass('async');
        if(sync){
            button.addClass('sync');
            button.attr('title','Đang đồng bộ');
        }else{
            button.addClass('async');
            button.attr('title','Đang không đồng bộ');
        }
    }

    function sendToggleSync(data) {
		storm.comm.socket.emit("toggleSync", storm.parentBoardId, data);
    }

	function bindEvents() {
		$("#boards-tab").on("click",".sync-whiteboard",function(){
	        if(storm.user.role == storm.roles.STUDENT){
	            return;
	        }

	        if(storm.sessionStatus != 1) {
	        	alert('Chức năng đồng bộ chỉ có tác dụng khi lớp đang diễn ra');
	        	return;
	        }
	        if($(this).hasClass('sync')){
	            boardSync.toggleSync(0);
	        }else if($(this).hasClass('async')){
	            boardSync.toggleSync(1);
	        }
	    });
	}

	return boardSync;
});