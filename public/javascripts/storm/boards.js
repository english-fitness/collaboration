define(["storm","storm.ui","storm.util","storm.fabric","storm.events","board.pdf","underscore","licode.client"],
    function (storm,ui,util,mfabric,events,boardPdf,licode,_) {

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

            bindEvents();
        },
        setBoardFromServer: function(data) {
            if(data.boardId && data.boardName){
                var boardObj = $('#boards-tab').find('li[data-holder='+data.boardId+']');
                boardObj.find('a.link-board span.boardName').html(data.boardName);

                if(storm.dataBoards[data.boardId]){
                    storm.dataBoards[data.boardId].students = data.students;
                    if(!util.isAllowBoard(data.boardId)) {
                        // jump to main board
                        $("#boards div#boards-tab ul li:first a.link-board").click();
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
            if(!util.isAllowBoard(boardId)) return;

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
        },
        createChildBoard:function() {
            var canvasId = generateCanvasId();
            var name = "Bảng "+canvasId.substring(6);
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
                    '<span class="setting" title="Chỉnh sửa, phân quyền" data-toggle="modal" data-target="boardSettings"></span>'+
                    '<span class="remove" title="Xóa tab"></span></li>'
            );
        },
        removeChildBoard: function(boardId, activeBoardId) {
            if(!util.isAllowBoard(activeBoardId)) activeBoardId = storm.parentBoardId;
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
                var append_data = '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students"  id="student_0" value="0" checked> <label for="student_0" class="lab">Tất cả</label><br />';
            }else{
                var append_data = '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students"  id="student_0" value="0"> <label for="student_0" class="lab">Tất cả</label><br />';
            }

            for(var uid in users){
               if(users[uid].role == storm.roles.STUDENT){
                   if(students[0] && students[0] == uid){
                       append_data += '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students" id="student_'+uid+'" value="'+uid+'" checked> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
                   }else{
                       append_data += '<input type="radio" name="boardPermmistion" onchange="$(\'#settingBoardName\').val($(this).next().text())" class="students" id="student_'+uid+'" value="'+uid+'"> <label for="student_'+uid+'" class="lab">'+ users[uid].name + '</label><br/>';
                   }
               }
            }
            $('#roleAccessBoard').html(append_data)


            $('#boardSettings').modal('show');
        });

        $("#boards div#boards-tab .board-icon-add").click(function() {
            if(storm.user.isStudent()) return;
            boards.createChildBoard();
        });

        $('#saveBoardSettings').click(function(e){
            var boardName = $('#settingBoardName').val();
            var students = [];
            var student = $('input[name="boardPermmistion"]:checked').val();

            if(student && student != "0"){
                students.push(student);
            }
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
        storm.boardLoaded[data.boardId] = true;
    }

    function sendSetActive(data) {
        storm.comm.socket.emit("setActive", storm.parentBoardId, data);
        console.log("chuyen bang  duoiiiiiii: "+storm.parentBoardId+",data:"+data.boardId);
    }

    function generateCanvasId() {
        var lastboard = $('#boards-tab ul li:last').attr('data');
        var lastid = lastboard.split('canvas');
        var lastid = parseInt(lastid[1]) + 1;
        return 'canvas'+lastid;
    }

    return boards;
});