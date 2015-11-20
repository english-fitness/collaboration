/* fabric related methods */

define(["storm", "storm.util", "storm.palettes.properties", "storm.ui", "storm.events", "geometry.tools"], function (storm, util, properties, ui, events, geometry) {

    'use strict';

    return {
        initialize:function() {
            observe('object:modified');
            observe('path:created');
            observe('selection:cleared');
            observe('object:cleared');
            observe('object:selected');
            observe('object:moving');
            observe('selection:created');

            observe('mouse:down');
            observe('mouse:move');
            observe('mouse:up');
            observe('object:added');
            //bar shift click #171
            //stopShiftClick();
            //bar negative resize #158
            stopNegativeDimension();
        }
    };

    function stopShiftClick() {
        var original = canvas.__onMouseDown;
        canvas.__onMouseDown = function(e) {
            if (e.shiftKey) {
                $('div.shift-click-alert').slideDown(400).delay(2000).fadeOut(1000);
                return true;
            } else {
                original.call(this, e);
            }
        }
    }


    function stopNegativeDimension() {
        var original = canvas._resizeObject;
        canvas._resizeObject = function(x, y, direction) {
            var target = canvas._currentTransform.target, memo = {}, memoFields = ['top', 'left', 'width', 'height'];
            memoFields.forEach(function(memoField) { memo[memoField] = target[memoField]; });
            original.call(this, x, y, direction);
            //restore if the move spoilt the width or height
            if (target.width < 1 ||  target.height < 1) {
                memoFields.forEach(function(memoField) { target[memoField] = memo[memoField]; });
            }
        }
    }


    /**
     *  Check for the event fired by fabric when any of the canvas objects modified and apply update properites panel accordingly
     *  @method  observe
     *  @param eventName - name of the event fired by fabricjs
     */
    function observe(eventName) {
        canvas.observe(eventName, function (e) {
            switch (eventName) {
            case "object:cleared":
                var obj = e.target;
                obj.setCoords();
                break;
            case "object:modified":
                // Check if it is a group of objects and dont perform any action
                if (canvas.getActiveGroup()) {  //TODO
                    events.notifyServerGroupMoved();
                    return;
                }

                //var obj = e.memo.target; // Get currently modified object
                var object = e.target; // Get currently modified object

                storm.comm.sendDrawMsg({ // Notify about this to server
                    action: "modified",
                    name: object.name,
                    palette: object.palette,
                    path: object.path,
                    args: [{
                        uid: object.uid,
                        latex:object.latex?object.latex:"",
                        showEditIcon:object.showEditIcon?object.showEditIcon:"",
                        top:object.top,
                        left:object.left,
                        originX:object.originX,
                        originY:object.originY,
                        object: object
                    }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
                });
                //store original state information or undo/redo actions
                storm.hLine.set('top', -10); // hide horizontal alignment guide line
                storm.vLine.set('left', -10); // hide vertical alignment guide line
                properties.updatePropertyPanel(obj); // Update property values for this object in property panel
                storm.quickMenu.showQuickMenu(object);
                object.setCoords();
                break;
            case "selection:created":
                // storm.quickMenu.showQuickMenuGroup(canvas.getActiveGroup());
                break;
            case "selection:cleared":
                //$('#propdiv').dialog("close");
                //if(!storm.isUpdatingProperties)
                storm.quickMenu.hideQuickMenu();
                storm.quickMenu.hideQuickMenuGroup();
                break;
            case 'path:created': // When path creation is completed by user
                var pathObj = e.path;

                var typeAcion = 'path';

                pathObj.uid = util.uniqid(); // Assign a Unique ID for this object
                pathObj.name = "drawingpath";
                pathObj.palette = storm.paletteName;

                var obj = {
                    action: 'drawpath',
                    type:typeAcion,
                    palette: storm.paletteName,
                    args: [{
                        uid: pathObj.uid,
                        // left: pathObj.left - pathObj.width/2,
                        // top: pathObj.top -  pathObj.height/2,
                        left: pathObj.left,
                        top: pathObj.top,
                        originX: "center",
                        originY: "center",
                        width: pathObj.width,
                        height: pathObj.height,
                        path: pathObj.path,
                        name: pathObj.name,
                        strokeWidth:storm.highlightMode?storm.highlightSize:storm.eraseMode?storm.eraserSize:canvas.freeDrawingBrush.width,
                        palette: storm.paletteName,
                        stroke: storm.highlightMode?storm.highlightCorlor:storm.eraseMode?storm.eraserCorlor:canvas.freeDrawingBrush.color//pathObj.stroke
                    }]
                };

                storm.comm.sendDrawMsg(obj);
                storm.xPoints = []; // nullify x points array
                storm.yPoints = []; // nullify x points array
                break;
            case 'object:selected':
                if(storm.isUpdatingProperties) return;
                //var selectedObj = e.memo.target; // Get selected object reference
                var selectedObj = e.target;
                //canvas.setActiveObject(selectedObj);
                if(selectedObj.strokeWidth){
                    $('#border input').val(selectedObj.strokeWidth);
                }

                // Check if it is a group of objects and dont perform any action
                if (canvas.getActiveGroup()) {
                    storm.quickMenu.showQuickMenuGroup(selectedObj);
                    return;
                }

                // Show property panel for this selected object
                //properties.createPropertiesPanel(selectedObj);
                storm.quickMenu.showQuickMenu(selectedObj);
                break;
            case 'object:moving':
                // Get moving object reference
                //var movingObj = e.memo.target;
                var movingObj = e.target;

                //if(movingObj && movingObj.type == 'text' && (storm.modifyText)) return;
                // Check for Alignment of this object with all other objects on canvas
                $(".load-text-box").hide();
                storm.quickMenu.hideQuickMenu();
                storm.quickMenu.hideQuickMenuGroup();
                break;
            case 'object:resizing':

                // Get resizing object reference
                //var resizingObj = e.memo.target;
                var resizingObj = e.target;
                resizingObj.setCoords();
                var props = [];
                props.push(resizingObj);
                if (storm.palette[resizingObj.palette]) {
                    storm.palette[resizingObj.palette].shapes[resizingObj.name].resizeAction ? storm.palette[resizingObj.palette].shapes[resizingObj.name].resizeAction.apply(null, props) : null;
                }
                break;
            case 'object:scaling':
                //var scalingObj = e.memo.target,
                var scalingObj = e.target,
                cursorStyle = canvas.upperCanvasEl.style.cursor,
                curLeft = scalingObj.originalState.left,    //left of the object before scaling
                curTop = scalingObj.originalState.top,  //top of the object before scaling
                scalingWidth = scalingObj.width,    //object width
                curWidth = scalingObj.currentWidth, //object width after scaling
                scalingHeight = scalingObj.height,  //object height
                curHeight = scalingObj.currentHeight,   //object height after scaling
                scaleWidth = 0,
                scaleHeight = 0;
                if (cursorStyle == 'e-resize') {    //when an object is scaled in east direction
                    scaleWidth = scalingWidth * scalingObj.scaleX;  //object width while scaling
                    scalingObj.left = curLeft + (scaleWidth - curWidth)/2;  //object left after scaling (move towards right)
                } else if (cursorStyle == 'w-resize') { //when an object is scaled in west direction
                    scaleWidth = scalingWidth * scalingObj.scaleX;  //object width while scaling
                    scalingObj.left = curLeft - (scaleWidth - curWidth)/2;  //object left after scaling (move towards left)
                } else if (cursorStyle == 'n-resize') { //when an object is scaled in north direction
                    scaleHeight = scalingHeight * scalingObj.scaleY;    //object height while scaling
                    scalingObj.top = curTop - (scaleHeight - curHeight)/2;  //object top after scaling (move towards north)
                } else if (cursorStyle == 's-resize') { //when an object is scaled in south direction
                    scaleHeight = scalingHeight * scalingObj.scaleY;    //object height while scaling
                    scalingObj.top = curTop + (scaleHeight - curHeight)/2;  //object top after scaling (move towards south)
                } else if (cursorStyle == 'ne-resize') {    //when an object is scaled in north east direction, move the left and top in east and north directions
                    scaleHeight = scalingHeight * scalingObj.scaleY;
                    scalingObj.top = curTop - (scaleHeight - curHeight)/2;
                    scaleWidth = scalingWidth * scalingObj.scaleX;
                    scalingObj.left = curLeft + (scaleWidth - curWidth)/2;
                } else if (cursorStyle == 'nw-resize') {    //when an object is scaled in north west direction, move the left and top in west and north directions
                    scaleHeight = scalingHeight * scalingObj.scaleY;
                    scalingObj.top = curTop - (scaleHeight - curHeight)/2;
                    scaleWidth = scalingWidth * scalingObj.scaleX;
                    scalingObj.left = curLeft - (scaleWidth - curWidth)/2;
                } else if (cursorStyle == 'se-resize') {    //when an object is scaled in south east direction, move the left and top in east and south directions
                    scaleHeight = scalingHeight * scalingObj.scaleY;
                    scalingObj.top = curTop + (scaleHeight - curHeight)/2;
                    scaleWidth = scalingWidth * scalingObj.scaleX;
                    scalingObj.left = curLeft + (scaleWidth - curWidth)/2;
                } else if (cursorStyle == 'sw-resize') {    //when an object is scaled in south west direction, move the left and top in west and south directions
                    scaleHeight = scalingHeight * scalingObj.scaleY;
                    scalingObj.top = curTop + (scaleHeight - curHeight)/2;
                    scaleWidth = scalingWidth * scalingObj.scaleX;
                    scalingObj.left = curLeft - (scaleWidth - curWidth)/2;
                }
                break;

            case 'mouse:down':
                e = setEvent(e);
                if(geometry[storm.action])
                    return geometry[storm.action].onMouseDown(e);
                events.mouseDown(e);
                break;
            case 'mouse:move':
                e = setEvent(e);
                if(geometry[storm.action])
                    return geometry[storm.action].onMouseMove(e);
                events.mouseMove(e);
                break;
            case 'mouse:up':
                e = setEvent(e);
                if(geometry[storm.action])
                   return geometry[storm.action].onMouseUp(e);
                events.mouseUp(e);
                break;
            case 'object:added':
                if(!storm.enableDraw) {
                    e.target.selectable = false;
                }
                break;
            }
        });
    }

    function setEvent(e) {
        e.mouse = canvas.getPointer(e.e);
        return e;
    };
});