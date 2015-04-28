define(["storm", "storm.util", "board.scroll"], function(storm, util, boardScroll) {

    var boardMouse = {
        init: function() {
            storm.comm.socket.on("mousePointClick", function (data) {
                if(data.mouse_X && data.mouse_Y){
                    var scrollTop = $('#containerDiv').scrollTop();
                    var scrollLeft = $('#containerDiv').scrollLeft();
                    var width = $('#containerDiv').width();
                    var height = $('#containerDiv').height();

                    if(data.mouse_X < scrollLeft) {
                        var sl = data.mouse_X < 50 ? 0 : data.mouse_X - 50;
                        boardScroll.setScrollLeft(sl);
                    } else if(data.mouse_X > (width + scrollLeft)) {
                        var sl = data.mouse_X - $('#containerDiv').width() + 50;
                        boardScroll.setScrollLeft(sl);
                    }

                    if(data.mouse_Y < scrollTop) {
                        var st = data.mouse_Y < 50 ? 0 : data.mouse_Y - 50;
                        boardScroll.setScrollTop(st);
                    } else if(data.mouse_Y > (height + scrollTop)) {
                        var st = data.mouse_Y - height + 50;
                        boardScroll.setScrollTop(st);
                    }

                    clickPoint(data.mouse_X,data.mouse_Y);
                }
            });

            storm.comm.socket.on("mousePointMove", function (data) {
                if(data.mouse_X && data.mouse_Y){
                    $('#remote_mouse').css({top:data.mouse_Y,left:data.mouse_X});
                }
            });

            storm.comm.socket.on("mousePointStart",function(data){
                if(data.action == 'start'){
                    $('#remote_mouse').show();
                }else{
                    $('#remote_mouse').hide();
                }
            });
        },

        mousePointClick: function (data) {
            storm.comm.socket.emit("mousePointClick", storm.parentBoardId, data);
            clickPoint(data.mouse_X, data.mouse_Y);
        },
        mousePointStart: function (data) {
            storm.comm.socket.emit("mousePointStart", storm.parentBoardId, data);
        },
        mousePointMove: function (data) {
            var loc = document.location.pathname;
            storm.comm.socket.emit("mousePointMove", storm.parentBoardId, data);
        }

    };

    function clickPoint(mouse_X,mouse_Y) {
        var imgObj = util.getDefaultDataFromArray(storm.palette['shapes'].shapes['circle'].properties);
        var currentUid = imgObj.uid = util.uniqid();

        storm.shapeArgs = [imgObj];
        storm.shapeArgs[0].name = 'circle';
        storm.shapeArgs[0].width = storm.shapeArgs[0].height = 18;
        storm.shapeArgs[0].left =  mouse_X - 9;
        storm.shapeArgs[0].top = mouse_Y - 9;
        storm.shapeArgs[0].stroke = 'red';
        storm.shapeArgs[0].strokeWidth = 1;
        storm.shapeArgs[0].uid = currentUid;
        storm.shapeArgs[0].radius = 9;
        storm.shapeArgs[0].palette = 'shapes';
        storm.palette['shapes'].shapes['circle'].toolAction.apply(this, storm.shapeArgs);

        var _activeObj = canvas.item(canvas.getObjects().length-1);
        _activeObj.hasControls = false;

        _activeObj.selectable = false;

        canvas.renderAll();
        var circleSize = 5;
        var count = 2;
        for(circleSize = 15; circleSize < 60;circleSize+=count){
            var actObj = util.getObjectById(currentUid,canvas);
            if(circleSize > 57){
                setTimeout(function(){
                    var i_d = 0;
                    for(i_d=60; i_d > 2;i_d -=1){
                        var _actObj = util.getObjectById(currentUid,canvas);
                        if(i_d <= 5){
                            canvas.remove(_actObj);
                            canvas.renderAll();
                            break;
                        }
                        _actObj.top = mouse_Y - i_d/2;
                        _actObj.left = mouse_X - i_d/2;
                        _actObj.width = i_d;
                        _actObj.height = i_d;
                        _actObj.radius = i_d/2;
                        _actObj.setCoords();
                    }
                },300);
            }
            actObj.width = circleSize
            actObj.height = circleSize;
            actObj.radius = circleSize/2;
            actObj.top = mouse_Y - circleSize/2;
            actObj.left = mouse_X - circleSize/2;
            actObj.setCoords();
        }

    }

    return boardMouse;
});