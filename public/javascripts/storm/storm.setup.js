define(["storm","storm.util", "licode.client", "storm.fabric", "storm.comm", "storm.main", "storm.containers","boards", "storm.containers.devices",
  "storm.layouts", "features/modified-by-user", "features/list-users", "features/chat", "features/popup", "features/question", "features/user-actions", "storm.events",
  "storm.ui", "board.files", "board.scroll", "board.session", "board.sync", "board.pdf", "board.mouse", "board.export", "board.quick-menu", "user",
  "storm.palettes", "storm.palettes.basicshapes", "storm.palettes.components"],
  function (storm, util ,licode, mfabric, Comm, main, containers,boards, devices, layouts, modifiedByUser, listUsers, chat, popup, question, userActions,
    events, ui, boardFiles, boardScroll, boardSession, boardSync, boardPdf, boardMouse, boardExport, quickMenu, user, palettes) {
    "use strict";
	//Dom Ready function
	$(function () {
		var serverURL = window.location.protocol+'//'+window.location.host,
			comm = new Comm(serverURL);
		/**
         * Initializes the application with the containers and layout set by user or asks your to choose them if not set yet
         * @method comm.onContainerDraw
         * @param data - container name and layout type
         *
         */
		comm.onContainerDraw = function (data) {
			/* get container and layout data from server if any and assing it */
			data == 'empty' ? storm.containerName = data : storm.containerName = data.parent.container;
			/* if data is available then start application with this container and layout */
			if (storm.containerName !== 'empty') {
				containers.containerName = storm.containerName;
                var parent = data.parent;

                var children = data.children;
                storm.currentBoardId = parent.active?parent.active:parent.boardId;
				containers.canvasWidth = parent.canvasWidth;
				containers.canvasHeight = parent.canvasHeight;
                //containers.canvasWidth = window.innerWidth;
                //containers.canvasHeight = window.innerHeight;
				containers.setContainer(storm.containerName, 'old', containers.canvasWidth, containers.canvasHeight);
			    $('#boardName').text(parent.name);
			    $('#boardName').css("top",$('#boardName').width()+60);
                storm.dataBoards[parent.boardId] = parent;

                boardSession.setTime();
                boardSync.displaySyncButton(parent.sync);

                if(children.length > 0){
                    children.forEach(function(child) {
                        if(child.boardId){
                            storm.dataBoards[child.boardId] = child;
                            boards.createChildBoardFromServer(child);
                        }
                    });
                }

                boards.setActiveBoard(storm.currentBoardId,true);

                return;
			}
			/* if data is not available or user logs in for the first time, show him the list of container names and layouts to choose */
			//layouts.createLayoutsList();
			//containers.createContainerList();
		}

        storm.comm = comm;
        storm.main = main;
        storm.palettes = palettes;
        storm.ui = ui;
        storm.boards = boards;
        // main.addTools();

        storm.quickMenu = quickMenu;
        storm.user = user;

        boards.init();

        modifiedByUser.init();
        listUsers.init();
        chat.init();
        popup.init();
        userActions.init();
        licode.init();
        boardFiles.init();
        boardScroll.init();
        boardSession.init();
        boardSync.init();
        boardPdf.init();
        boardMouse.init();
        boardExport.init();
        quickMenu.init();
	});
});
