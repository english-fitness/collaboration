define(["storm","storm.ui","storm.util","storm.fabric","storm.events","board.pdf","licode.client","underscore"],
    function (storm,ui,util,mfabric,events,boardPdf,licode,_) {
		
	var viewOnlyMode = false;

    var boards = {
        init: function() {
            this.createFabricCanvas("canvas0", true);

            storm.comm.socket.on('setBoard', function (data) {
                boards.setBoardFromServer(data);
            });

            storm.comm.socket.on('setActive', function (data) {
                boards.setActiveBoard(data.boardId,false);
            });

            storm.comm.socket.on('createTab', function (data) {
                boards.createChildBoardFromServer(data.data);
                if(storm.sync) {
                    boards.setActiveBoard(data.boardId,false);
                }
            });

            storm.comm.socket.on('removeTab', function (data) {
                if(data.boardId && data.activeBoardId) {
                    boards.removeChildBoard(data.boardId, data.activeBoardId);
                }
            });
			
			storm.comm.socket.on('expirationTime', function(remainingTime){
				if (remainingTime <= 0){
					activateViewOnlyMode();
				} else {
					setClassEndTimer(remainingTime);
				}
			});
			
			storm.comm.socket.on('doneLoadingBoard', function(data){
				storm.boardLoaded[data.boardId] = true;

				console.log('another board has done loading');
				if (allBoardLoaded()){
					console.log('all board loaded');
					storm.comm.socket.disconnect();
				} else {
					console.log('still something left');
				}
			})

            bindEvents();
        },
        setBoardFromServer: function(data) {
            if(data.boardId && data.boardName){
                var boardObj = $('#boards-tab').find('li[data-holder='+data.boardId+']');
                boardObj.find('a.link-board span.boardName').html(data.boardName);
				
                if(storm.dataBoards[data.boardId]){
                    storm.dataBoards[data.boardId].students = data.students;
					// console.log("Students disallowed allowed in this board: "+storm.dataBoards[data.boardId].students);
                    if(!util.isAllowBoard(data.boardId)) {
                        // jump to main board (doesn't seem to be working)
                        // $("#boards div#boards-tab ul li:first a.link-board").click();
						
						//disable left panel
						toggleDrawing(false);
						
						console.log("You are not allowed to write on the board " + data.boardId);
                    }
					else {
						toggleDrawing(true);
						console.log("You are allowed to write on the board " + data.boardId);
					}
                }
            }
        },
        createChildBoardFromServer: function(data) {
            storm.dataBoards[data.boardId] = data;
            var canvasId = generateCanvasId();
            this.appendBoard(canvasId, data.name, data.boardId);
            if(data.boardId == storm.currentBoardId){
                this.createNewCanvas(canvasId,true);
            }else{
                this.createNewCanvas(canvasId,false);
            }
            ui.resizeBoardTabs();
        },
        setActiveBoard: function(boardId, notify) {
            if(storm.dataBoards[boardId] == undefined) boardId = storm.parentBoardId;
            if(!storm.sync && !notify) return;
            // if(!util.isAllowBoard(boardId)) return;

            storm.currentBoardId = boardId;

            showTabButtons(boardId);
            storm.quickMenu.hideQuickMenu();
            storm.quickMenu.hideQuickMenuGroup();

            var canvasId  = $("#boards div#boards-tab ul li[data-holder="+boardId+"]").attr('data');
            window.canvas = storm.canvases[canvasId];
            canvas.renderAll();

            if($('.shape-selected').length){
                $('.shape-selected').click();
            }
            var dataBoard = storm.dataBoards[boardId];
            if(!storm.boardLoaded[boardId]) {
                sendLoadBoard({ boardId: boardId });

                boardPdf.loadPdfOnBoard(boardId);

                if(dataBoard && dataBoard.background){
                    canvas.setBackgroundColor({source:$.trim(dataBoard.background)},function() {
                        canvas.renderAll();
                    });
                    storm.loadedBackground[boardId] = true;
                }
            } else {
                if((dataBoard && dataBoard.docUrl) || storm.loadedPdf[boardId]) {
                    boardPdf.appendPagination(storm.totalPages[boardId]);
                    $('input.c-percent').val(Math.round(storm.currentScale[boardId]*100));
                    $('.navication .currentPage').val(storm.currentPages[boardId]);
                    $('.navication .totalPage').html(storm.totalPages[boardId]);
                    $('.navication').show();
                }else{
                    $('.navication').hide();
                }
            }

            $("#boards .canvasIdActive").hide();
            $("#boards .canvasIdActive[name='"+canvasId+"'] ").show();
            if(notify){
                sendSetActive({ boardId: boardId });
            }

            ui.resizeWindow();
			
			if (!util.isAllowBoard(boardId) || viewOnlyMode)
				toggleDrawing(false);
			else 
				toggleDrawing(true);
        },
        createChildBoard:function() {
            var canvasId = generateCanvasId();
            var name = "Tab "+canvasId.substring(6);
            this.appendBoard(canvasId, name, "");
            this.createTabToServer(name, function(err, childId) {
                boards.setActiveBoard(childId, true);
            });

            this.createNewCanvas(canvasId,true);
            ui.resizeBoardTabs();
        },
        initFabricCanvas:function() {
            ui.initWidthAndHeightOfPanels();
            ui.resizeWindow();
            //ui.setCanvasSize();
            ui.bindResizeWindow();
            ui.drawHVLines();
            canvas.isSelectMode = true;
            canvas.freeDrawingBrush.width = 1;
            canvas.freeDrawingBrush.color = '#000';

            storm.xOffset = util.getOffset(document.getElementById('canvasId')).left+storm.xOffset;
            storm.yOffset = util.getOffset(document.getElementById('canvasId')).top+ storm.yOffset;

            mfabric.initialize();
        },
        createFabricCanvas: function(canvasId, active) {
            window.canvas = storm.canvases[canvasId] = new fabric.Canvas(canvasId, {
                backgroundImageStretch: false
            });
            if(active) {
                $("#boards .canvasIdActive").hide();
                $("#boards .canvasIdActive[name='"+canvasId+"'] ").show();
                storm.currentCanvas = document.getElementById(canvasId);
            }

            this.initFabricCanvas();
        },
        createTabToServer: function(name, callback) {
            var students = [];
            var boardName = name;
            var data = {
                parentId:storm.parentBoardId,
                whiteboardName:boardName,
                students:students
            }
            $.post(baseUrl+'boards/createtab',data).done(function(data) {
                if(data.success && data.boardId && data.data){
                    storm.currentBoardId=data.boardId;
                    storm.dataBoards[data.boardId] = data.data;
                    $("#boards div#boards-tab ul li:last").attr("data-holder",data.boardId);
                    sendCreateTab({
                        boardId:data.boardId,
                        parentId:storm.parentBoardId,
                        students:students,
                        name:boardName,
                        data:data.data
                    });

                    callback && callback(null, data.boardId);
                } else {
                    callback && callback('create tab error');
                }
            });
        },
        removeTabToServer: function(boardId, activeBoardId) {
            var data = { boardId: boardId, activeBoardId: activeBoardId };
            $.post(baseUrl + 'boards/removetab',data)
            .done(function(data) {
                if(data.success){
                    storm.currentBoardId=storm.parentBoardId;
                    sendRemoveTab({ boardId: boardId, activeBoardId: activeBoardId });
                }
            });
        },
        appendBoard: function(canvasId, name, boardId) {
            $('.navication').hide();
            $("#boards div#boards-tab ul").append(
                '<li data="'+canvasId+'" data-holder="'+boardId+'" class="tab-wb">' +
                    '<a class="link-board" href="#">' +
                    '<span class="boardName">'+name+'</span></a>' +
                    '<span class="setting" title="Settings" data-toggle="modal" data-target="boardSettings"></span>'+
                    '<span class="remove" title="Delete tab"></span></li>'
            );
        },
        removeChildBoard: function(boardId, activeBoardId) {
            // if(!util.isAllowBoard(activeBoardId)) activeBoardId = storm.parentBoardId;
            var canvasId = $("#boards div#boards-tab ul li[data-holder='"+boardId+"']").attr("data");
            var activeCanvasId = $("#boards div#boards-tab ul li[data-holder='"+activeBoardId+"']").attr("data");

            $("#boards div#boards-tab ul li[data-holder='"+boardId+"']").remove();
            $("#boards .canvasIdActive[name='"+canvasId+"']").remove();

            window.canvas = storm.canvases[activeCanvasId];
            $("#boards .canvasIdActive").hide();
            $("#boards .canvasIdActive[name='"+activeCanvasId+"'] ").show();

            showTabButtons(activeBoardId);

            boardPdf.loadPdfOnBoard(activeBoardId);

            if(!storm.boardLoaded[activeBoardId]) {
                sendLoadBoard({ boardId: activeBoardId });
            }
            ui.resizeBoardTabs();
        },
        createNewCanvas: function(canvasId, active) {
            $("#boards #canvasAll").append("<div class='canvasIdActive child-board-canvas' style='display: none' name='"+canvasId+"'><canvas id='"+canvasId+"'></canvas></div>");
            this.createFabricCanvas(canvasId, active);
        },

        sendLoadBoard: sendLoadBoard
    }

    function bindEvents() {
        $("#boards div#boards-tab ul").on("click","li a.link-board",function() {
            if(storm.showingLoad) return;

            if(storm.user.isStudent() && storm.sync) return;

            var boardId = $(this).parent().attr("data-holder");
            boards.setActiveBoard(boardId, true);
        });

        $("#boards").on("click",".board-icon-setting",function(){
            if(storm.user.isStudent()) return;
            var li = $(this).parents('li.tab-wb');
            if(!li.hasClass('active')) return false;
            var boardInfo = storm.dataBoards[storm.currentBoardId];
            $('#settingBoardName').val(boardInfo.name);

            var users = storm.dataBoards[storm.parentBoardId].users;
            var students = boardInfo.students;
            if(_(students).isEmpty()){
                var append_data = '<input type="checkbox" name="All" class="students" id="selectAll" checked><label>All</label><br>';
            }else{
                var append_data = '<input type="checkbox" name="All" class="students" id="selectAll"><label>All</label><br>';
            }

			var currentUsers = storm.users;
			
            for(var uid in users){
				if(users[uid].role == storm.roles.STUDENT){
					if(students && _(students).contains(uid)){
						if (currentUsers[uid])
							append_data += '<input type="checkbox" name="boardPermmistion" class="students" id="student_'+uid+'" value="'+uid+'"> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
						else
							append_data += '<input type="checkbox" name="boardPermmistion" class="students" id="student_'+uid+'" value="'+uid+'"> <label for="student_'+uid+'" class="lab">'+ users[uid].name + ' (Not in class)</label><br/>';
					}else{
						if (currentUsers[uid])
							append_data += '<input type="checkbox" name="boardPermmistion" class="students" id="student_'+uid+'" value="'+uid+'" checked> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
						else
							append_data += '<input type="checkbox" name="boardPermmistion" class="students" id="student_'+uid+'" value="'+uid+'" checked> <label for="student_'+uid+'" class="lab">'+ users[uid].name + ' (Not in class)</label><br/>';
                   }
               }
			   
			   /*---OLD---*/
               // if(users[uid].role == storm.roles.STUDENT){
                   // if(students[0] && students[0] == uid){
                       // append_data += '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students" id="student_'+uid+'" value="'+uid+'" checked> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
                   // }else{
                       // append_data += '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students" id="student_'+uid+'" value="'+uid+'"> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
                   // }
               // }
            }
			
            $('#roleAccessBoard').html(append_data)

			$("#selectAll").change(function(){
				if ($(this).is(':checked')){
					$("input:checkbox.students").each(function(){
						$(this).prop("checked", true);
					});
				} else {
					$("input:checkbox.students").each(function(){
						$(this).prop("checked", false);
					});
				}
			});
			
            $('#boardSettings').modal('show');
        });

        $("#boards div#boards-tab .board-icon-add").click(function() {
            if(storm.user.isStudent()) return;
            boards.createChildBoard();
        });

        $('#saveBoardSettings').click(function(e){
			//NOTE: variable students
			//originally it contains student allowed, empty = allow all, else allow anyone in the list
			//since we need to be able to disallow all, now anyone in the list is not allowed, empty = allow all (it's reversed)
			
            var boardName = $('#settingBoardName').val();
            var students = [];
            // var student = $('input[name="boardPermmistion"]:checked').val();
			
			var student = $('input[name="boardPermmistion"]:not(:checked)').map(function() {
				return this.value;
			}).get();
			
            if(student){
				for (var i = 0; i < student.length; i++)
				{
					students.push(student[i]);
				}
            }
			
			console.log("Disallow these students: "+students);
			
            storm.dataBoards[storm.currentBoardId].students = students;
            storm.dataBoards[storm.currentBoardId].name = boardName;
            var boardObj = $('#boards-tab').find('li[data-holder='+storm.currentBoardId+']');
            boardObj.find('a.link-board span.boardName').html(boardName);
            $('#boardSettings').modal('hide');
            sendSetBoard({
                boardId: storm.currentBoardId,
                boardName:boardName,
                students:students
            });
        });

        $("#boards div#boards-tab ul ").on("click","li span.board-icon-close",function(){
            if(storm.user.isStudent()) return;
            var boardId = $(this).parent().attr("data-holder");
            var activeBoardId = $(this).parent().prev().attr("data-holder");

            boards.removeTabToServer(boardId, activeBoardId);
            boards.removeChildBoard(boardId, activeBoardId);
        });

        document.onkeydown = events.keyDown;

        $('.load-text-box').on('change','#choose-font',function(){
            $(".load-text-box textarea").css({"line-height":($(this).val())+"px","font-size":($(this).val())+"px"});
        });

        $("#color ul ul li").click(function(){

            var type = $(this).attr("name"),
                color = $(this).attr("color")
            $("#color ul  ul li[name='"+type+"']").removeClass("click");
            $(this).addClass("click");
            $(this).parents("#color ul li").find("span.mau").css("background",color);


            var objActive = canvas.getActiveObject();
            if(type == 'border') {
                canvas.freeDrawingBrush.color = color;
            }

            if(!objActive){ return; }
            if(type == 'background'){
                if(objActive.type == 'text'){
                    objActive.set('textBackgroundColor',color);
                }else{
                    objActive.set('fill',color);
                }
            }else if(type = 'border'){
                objActive.set('stroke',color);
                $(".load-text-box textarea").css("color",color);
            }
            canvas.renderAll();
            storm.comm.sendDrawMsg({ // Notify about this to server
                action: "modified",
                name: objActive.name,
                palette: objActive.palette,
                path: objActive.path,
                args: [{
                    uid: objActive.uid,
                    object: objActive
                }]
            });

        });

        $("#border span").click(function(){
            var name = $(this).attr("class");
            var val = parseInt($("#border input[name='input-border']").val());
            if(name=="minus"){
                if(val>1){
                    $("#border input[name='input-border']").val(val-1);
                }
            }else if(name=="plus"){
                $("#border input[name='input-border']").val(val*1+1);
            }
            var objActive = canvas.getActiveObject();
            if(!objActive){ return; }
            objActive.set('strokeWidth',val);
            canvas.renderAll();
            storm.comm.sendDrawMsg({ // Notify about this to server
                action: "modified",
                name: objActive.name,
                palette: objActive.palette,
                path: objActive.path,
                args: [{
                    uid: objActive.uid,
                    object: objActive
                }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
            });
        });

        $('body').click(function(e){
            var _target = e.target;
            util.changeText(_target);
        });

        $(".rightdiv").click(function(){
            setTimeout(function(){
                ui.resizeRightDiv();
            },100);
        });
    }

    function showTabButtons(boardId) {
        $("#boards div#boards-tab ul li.active span.setting").removeClass('board-icon-setting');
        $("#boards div#boards-tab ul li.active span.remove").removeClass('board-icon-close');

        $("#boards div#boards-tab ul li").removeClass("active");
        $("#boards div#boards-tab ul li[data-holder="+boardId+"]").addClass("active");

        $("#boards div#boards-tab ul li[data-holder="+boardId+"] span.setting").addClass('board-icon-setting');
        $("#boards div#boards-tab ul li[data-holder="+boardId+"] span.remove").addClass('board-icon-close');
    }

    function sendCreateTab(data) {
        storm.comm.socket.emit("createTab", storm.parentBoardId, data);
    }

    function sendRemoveTab(data) {
        storm.comm.socket.emit("removeTab", storm.parentBoardId, data);
    }

    function sendSetBoard(data) {
        storm.comm.socket.emit("setBoard", storm.parentBoardId, data);
    }

    function sendLoadBoard(data) {
        storm.comm.socket.emit("loadBoard", storm.parentBoardId, data);
    }

    function sendSetActive(data) {
        storm.comm.socket.emit("setActive", storm.parentBoardId, data);
    }

    function generateCanvasId() {
        var lastboard = $('#boards-tab ul li:last').attr('data');
        var lastid = lastboard.split('canvas');
        var lastid = parseInt(lastid[1]) + 1;
        return 'canvas'+lastid;
    }
	
	function toggleDrawing(status) {
		if (!status) {
			/*  disable all  */
			var leftdiv = $("#leftdiv");
			
			leftdiv.css("pointer-events", "none");
			
			if (viewOnlyMode){
				$('#upload_pdf_image').hide();
				$('#upload_image_from_link').hide();
				$('#chat').prop('disabled', true);
				$('.rightdiv').css("pointer-events", "none");
				$('.rightdiv > .ui-widget-content > .bdrT > .slimScrollDiv').css("pointer-events", "auto");
				leftdiv.find(".dropdown").css("pointer-events", "auto");
			} else {
				leftdiv.find(".dropdown").css("opacity", 0.3);
			}
			leftdiv.find(".shape-holder").css("opacity", 0.3);
			$("#colorTools").css("opacity", 0.3);
			
			// var clickButton = $("*[data-shape=click]")
			// clickButton.css("opacity", 1);
			// clickButton.css("pointer-events", "auto");
			// var select = $("#pointer-shape");
			// select.css("opacity", 1);
			// select.css("pointer-events", "auto");
			// select.click();
			
			//disable selecting, discard all selecting
			storm.action = "";
			storm.enableDraw = false;
			
			_(storm.canvases).each(function(canvas) {
                canvas.discardActiveObject();
                canvas.discardActiveGroup();
                canvas.isSelectMode = false;
                canvas.isDrawingMode = false;
                canvas.isSelectMode = false;
                canvas.selection = false;

                var objAll = canvas.getObjects();

                if(objAll) {
                    $.each(objAll,function(index,value){
                        value.selectable = false;
                    });
                }
                canvas.renderAll();
            });
			
		} else {
			var leftdiv = $("#leftdiv");
			leftdiv.find(".dropdown").css("opacity", 1);
			leftdiv.find(".shape-holder").css("opacity", 1);
			$("#colorTools").css("opacity", 1);
			leftdiv.css("pointer-events", "auto");
			var selected = leftdiv.find(".shape-selected");
			if (selected)
			{
				selected.click();
			}
			
			storm.enableDraw = true;
		}
		
	}
	
	function activateViewOnlyMode(){
		console.log('view only mode activated');
		viewOnlyMode = true;
		toggleDrawing(false);
		storm.reloadConfirm = false;
		if (window.navigator.language == 'vi'){
			alert('Buổi học này đã hết thời gian. Bạn đang ở chế độ xem.');
		} else {
			alert('This session has ran out of time. You are in view only mode.');
		}
		//disable drawing, messaging
		//draw everything on the board
		var dataBoard = storm.dataBoards;
		for (var boardId in dataBoard){
			if(!storm.boardLoaded[boardId]) {
				sendLoadBoard({ boardId: boardId, notifyWhenDone:true });

				boardPdf.loadPdfOnBoard(boardId);

				if(dataBoard && dataBoard.background){
					canvas.setBackgroundColor({source:$.trim(dataBoard.background)},function() {
						canvas.renderAll();
					});
					storm.loadedBackground[boardId] = true;
				}
			} else {
				if((dataBoard && dataBoard.docUrl) || storm.loadedPdf[boardId]) {
					boardPdf.appendPagination(storm.totalPages[boardId]);
					$('input.c-percent').val(Math.round(storm.currentScale[boardId]*100));
					$('.navication .currentPage').val(storm.currentPages[boardId]);
					$('.navication .totalPage').html(storm.totalPages[boardId]);
					$('.navication').show();
				}else{
					$('.navication').hide();
				}
			}
		}
		$('.board-icon-add').css('pointer-events', 'none');
		$('.board-icon-remove').css('pointer-events', 'none');
		$('.board-icon-setting').css('pointer-events', 'none');
	}

    function checkSessionTime(){
        console.log("Session time out check");
        $.ajax({
            type:"get",
            url:"/api/session/getTimeUntilExpiration?sessionId="+storm.sessionId,
            success:function(response){
                if (response.remainingTime < 0){
                    forceSessionEnd();
                } else {
                    console.log("Reset timer");
                    setClassEndTimer(response.remainingTime);
                }
            },
            error:function(){
                return;
            }
        })
    }
	
	function forceSessionEnd(){
		console.log('Session timed out. Terminating in 10 seconds');
		storm.reloadConfirm = false;
		ui.showForceEndSession();
		//we really want to just reload and enter the view only mode but there are still some concern.
		//So let's just force them out
		// setTimeout(function(){window.location.reload()}, 10000);
		setTimeout(function(){window.close()}, 10000);
	}
	
	function setClassEndTimer(remainingTime){
		if (remainingTime > 0 && remainingTime < 45*60){
			setTimeout(checkSessionTime, remainingTime*1000);
			console.log('Timer set for ' + remainingTime + ' seconds');
		}
	}
	
	function allBoardLoaded(){
		var dataBoards = storm.dataBoards;
		for (var boardId in dataBoards){
			if (!storm.boardLoaded[boardId])
				return false;
		}
		return true;
	}

    return boards;
});