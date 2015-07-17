/**
 * Comm: Client side socket connection and communicaiton handler
*/
define(["storm","storm.ui","storm.util"], function (storm, ui, util) {
   	"use strict";
	/*constructor*/
	function Comm(url) {
		// create socket connection object
        var resource = baseUrl.replace("/", "") + 'socket.io';
        var options = {resource: resource};
		this.socket = io.connect(url, options);
		// variable to hold reference of this object(Comm)
		var objRef = this;
		// Invoked when containerDraw method called on the server side
		this.socket.on("containerDraw", function (data) {
			objRef.drawContainerHandler(data);
		});
		// Invoked when eventDraw method called on the server side
		this.socket.on("eventDraw", function (data) {
			objRef.drawHandler(data);
		});

        this.socket.on("setBackground", function (data) {
            objRef.setBackgroundHandler(data);
        });

		// Invoked when eventConnect method called on the server side
		this.socket.on('eventConnect', function (data) {
			objRef.connectHandler(data);
		});

        this.socket.on('connect_failed', function () {
            console.log('connect failed');
        });

        this.socket.on('error', function (reason) {
            if(reason == "handshake unauthorized") {
                alert(" The account you are logging in has entered this session in a different place. Please try again later!");
            }
            console.log('connect error, reason: ' + reason);
        });

        this.socket.on('disconnect', function (reason) {
        	if('booted' != reason) {
        		setTimeout(ui.showDisconnecting,1000);
        	} else {
        		alert('You have been invited out of the classroom by the administrator. If you have any questions, please contact 0936125050 / 0961005057');
        		storm.reloadConfirm = false;
        		window.location.reload();
        	}
        });

        this.socket.on('kickUser', function() {
        	storm.comm.socket.disconnect();
        });
    }
	(function () {
		// Handler functions
		this.connectHandler = function (data) {
			this.onConnect(data);
		};
		this.drawHandler = function (data) {
			this.onDraw(data);
		};

        this.setBackgroundHandler = function (data) {
            if(data.background){
                return canvas.setBackgroundColor({source:$.trim(data.background)},function(){
                    canvas.renderAll();
                });
            }
        };

		this.drawContainerHandler = function (data) {
			this.onContainerDraw(data);
		};
		this.sendContainerInfo = function(data) {
			this.socket.emit("setContainer", storm.parentBoardId, data);
		};

		this.sendDrawMsg = function (data) {
            data.boardId = storm.currentBoardId;
            data.page = storm.currentBoardPage[storm.currentBoardId]?storm.currentBoardPage[storm.currentBoardId]:1;

			this.socket.emit("eventDraw", storm.parentBoardId, data);
		};
        this.setBackground = function (data) {
            data.boardId = storm.currentBoardId;
            this.socket.emit("setBackground", storm.parentBoardId, data);
        };

		this.onDraw = function (data) {
			//Dummy method must override
		};
		this.onConnect =  function (data) {
            ui.hideDisconnecting();
			var loc = document.location.pathname;
            var wb_url = loc.replace("/", "");
            var randomnString = wb_url.substr(wb_url.lastIndexOf('/') + 1);
            storm.parentBoardId = randomnString;
            $("#boards ul li:first").attr("data-holder",randomnString);
            /* reset whiteboard */
            $('#boards ul li.tab-wb').remove();
            //$('#canvasAll').empty();
            $('#canvasAll .child-board-canvas').remove();
            for(var idx in storm.boardLoaded){
                storm.boardLoaded[idx] = false;
            }
            _(storm.user).extend(data.user);

			this.socket.emit("setUrl", storm.parentBoardId);
		};
	}).call(Comm.prototype);
	return Comm;
});
