define(["storm", "storm.ui", "storm.comm", "storm.util","storm.palettes.properties","math.util", "board.mouse"],
    function (storm, ui, comm, util, properties,math, boardMouse) {
	"use strict";
	return {
		/**
		 * Listen for keyboard events and do necessary action
		 * @method keyDown
		 * @param e keyevent
		 */
	keyDown: function (e) {
      var evt = (e) ? e : (window.event) ? window.event : null;
      if (evt && ($("#propdiv:visible").length === 0)) {
        var key = (evt.charCode) ? evt.charCode : ((evt.keyCode) ? evt.keyCode : ((evt.which) ? evt.which : 0));
        if (key == "46") { //  DELETE
          //$(".load-text-box").html("");
          storm.quickMenu.hideQuickMenu();
          storm.quickMenu.hideQuickMenuGroup();
        } else{
            if(storm.drawText || storm.modifyText) return true;
        }
        if (key == "38" && evt.ctrlKey) { // CONTROL + Up Arrow
            var obj = canvas.getActiveObject();
            if (obj) {
              canvas.bringForward(obj);
              notifyZindexChange(obj, 'forward');
            }
        } else if (key == "40" && evt.ctrlKey) { // CONTROL + Down Arrow
            var obj = canvas.getActiveObject();
            if (obj) {
                canvas.sendBackwards(obj);
                notifyZindexChange(obj, 'backward');
            }
        } else if (key == "27") { // when Escape key pressed
        	evt.preventDefault();
            closePopup();
        } else if (key == "37" && evt.shiftKey) {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objleft = obj.left;
            	obj.set('left', objleft - (storm.horIndent * storm.indentMultiplier));
            	onObjectMoveByKey(obj);
            }
        } else if (key == "37") {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objleft = obj.left;
            	obj.set('left', objleft - storm.horIndent);
            	onObjectMoveByKey(obj)
            }
        } else if (key == "39" && evt.shiftKey) {
            var obj = canvas.getActiveObject();
            var objleft = obj.left;
            if(obj) {
            	obj.set('left', objleft + (storm.horIndent * storm.indentMultiplier));
            	onObjectMoveByKey(obj);
            }
        } else if (key == "39") {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objleft = obj.left;
            	obj.set('left', objleft + storm.horIndent);
            	onObjectMoveByKey(obj)
            }
        } else if (key == "38" && evt.shiftKey) {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objtop = obj.top;
            	obj.set('top', objtop - storm.verIndent * storm.indentMultiplier);
            	onObjectMoveByKey(obj)
            }
        } else if (key == "38") {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objtop = obj.top;
            	obj.set('top', objtop - storm.verIndent);
            	onObjectMoveByKey(obj)
            }
        } else if (key == "40" && evt.shiftKey) {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objtop = obj.top;
            	obj.set('top', objtop + storm.verIndent * storm.indentMultiplier);
            	onObjectMoveByKey(obj)
            }
        } else if (key == "40") {
            var obj = canvas.getActiveObject();
            if(obj) {
            	var objtop = obj.top;
            	obj.set('top', objtop + storm.verIndent);
            	onObjectMoveByKey(obj)
            }
        }
      }
    },

    /**
     * Listen for mouse down(on canvas after shape tool is selected) event and do necessary action
     * @method mouseDown
     * @param e mouseevent
     */
    mouseDown: function (event) {
      var _target = event.e.target;
      if(storm.action === 'text'){
        util.changeText(_target);
      }

     if(storm.action === 'math'){
         var mouse = canvas.getPointer(event.e);
         storm.mathX = mouse.x - parseInt(document.getElementById("canvasId").scrollLeft);//mouse.x;// event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - storm.xOffset; //offset
         storm.mathY = mouse.y - parseInt(document.getElementById("canvasId").scrollTop); //mouse.y;//event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - storm.yOffset;//offset

         canvas.deactivateAll();
         return math.createMathEditor("",mouse.x + parseInt(document.getElementById("canvasId").scrollLeft),mouse.y + parseInt(document.getElementById("canvasId").scrollTop));
     }

     if(storm.action === 'click'){
         var mouse = canvas.getPointer(event.e);
         storm.x = mouse.x;
         storm.y = mouse.y;
         boardMouse.mousePointClick({
             mouse_X: storm.x,
             mouse_Y: storm.y
         });
     }
     var trockWith = $('#border input').val();

      if (document.getElementById('delete_menuItem') && event.button == 0) { //if it is left click, remove the context menu item, if any
        $('#delete_menuItem').remove();
      }
      if (!canvas.isDrawingMode && storm.drawShape) {
        storm.points.x = event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - storm.xOffset; //offset
        storm.points.y = event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - storm.yOffset;//offset
        if(storm.groupCopyMode) {
        	var selected_group_obj_array = canvas.getActiveGroup().getObjects();
        	var createdObjArray = [];
        	$.each(selected_group_obj_array,function(index,value){
        		storm.action = value.name;
        		storm.paletteName = value.palette;
        		var obj = util.getPropertiesFromObject(storm.palette[storm.paletteName].shapes[storm.action].properties,value);
        		obj.uid = util.uniqid();
        		storm.shapeArgs = [obj];
        		storm.shapeArgs[0].left = storm.points.x + obj.left;
                storm.shapeArgs[0].top = storm.points.y + obj.top;
                createdObjArray.push({
                    palette: storm.paletteName,
                    action: storm.action,
                    args: storm.shapeArgs
                });
                drawObject(event);
        	});
        	storm.groupCopyMode = false;
        	$('span.copy_icon','div.m-quick-edit-group').removeClass('selected');

        }else{
            if(!canvas.isSelectMode){
                    //storm.shapeArgs[0].strokeWidth = trockWith;
                    storm.started = true;
                    if(storm.action === 'line'){
                        var mouse = canvas.getPointer(event.e);
                        storm.x = mouse.x;
                        storm.y = mouse.y;
                        storm.shapeArgs[0].left = storm.x;
                        storm.shapeArgs[0].top = storm.y;
                        var bgobj = $('#color ul li.background ul li.click');
                        if(bgobj.length == 0){
                            var color = '';
                        }else{
                            var color = bgobj.attr('color');
                        }
                        var border = $('#color ul li.border ul li.click').attr('color');
                        storm.shapeArgs[0].fill = color;
                        storm.shapeArgs[0].stroke = border;
                        storm.shapeArgs[0].width = storm.shapeArgs[0].height = 0;
                        if(storm.action === 'line'){
                            var points = [ mouse.x, mouse.y, mouse.x, mouse.y ];
                            storm.shapeArgs[0].points = points;

                        }
                        drawObject(event);
                        canvas.setActiveObject(canvas.item(canvas.getObjects().length-1));
                    }

                    var selectedObj = event.target;
                    if(storm.action == 'text'){
                        if(selectedObj && selectedObj.type=="text" && storm.modifyText){
                            //canvas.setActiveObject(selectedObj);
                            //util.textForm(selectedObj,true);
                        }else{
                            if(storm.drawText){
                                var mouse = canvas.getPointer(event.e);
                                storm.x = mouse.x;
                                storm.y = mouse.y;
                                storm.shapeArgs[0].left = storm.x;
                                storm.shapeArgs[0].top = storm.y;
                                var bgobj = $('#color ul li.background ul li.click');
                                if(bgobj.length == 0){
                                    var color = '';
                                }else{
                                    var color = bgobj.attr('color');
                                }
                                var border = $('#color ul li.border ul li.click').attr('color');
                                storm.shapeArgs[0].fill = border;
                                storm.shapeArgs[0].textBackgroundColor = color;
                                storm.shapeArgs[0].stroke = border;
                                storm.shapeArgs[0].width = storm.shapeArgs[0].height = 0;
                                storm.shapeArgs[0].uid = util.uniqid();
                                drawObject(event);
                                var _activeObj = canvas.item(canvas.getObjects().length-1);
                                _activeObj.fontSize = 16;
                                canvas.setActiveObject(_activeObj);
                                util.textForm(_activeObj,false);
                            }
                        }
                    }
            }
        }
      }
      if (canvas.isDrawingMode) {
          storm.xPoints = [];
          storm.yPoints = [];
          storm.xPoints.push(event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - storm.xOffset);
          storm.yPoints.push(event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - storm.yOffset);
      }

     },

     // Listen for right click of mouse and display context menu when any object on canvas is selected.
		contextMenu: function (event) {
			var obj = canvas.getActiveObject();
			if (obj &&
			(event.clientX -$('#canvasId').css('left').split('px')[0] - $('#leftdiv').css('width').split('px')[0]) >= (obj.left - obj.width/2) &&
			(event.clientX - $('#canvasId').css('left').split('px')[0] - $('#leftdiv').css('width').split('px')[0]) <= (obj.left + obj.width/2) &&
			(event.clientY - $('#canvasId').css('top').split('px')[0] - $('#header').css('height').split('px')[0]) >= (obj.top - obj.height/2) &&
			(event.clientY - $('#canvasId').css('top').split('px')[0] - $('#header').css('height').split('px')[0]) <= (obj.top + obj.height/2)) {
				//prevent the display of default context menu.
				event.preventDefault();
				if (document.getElementById('delete_menuItem')) {
					$('#delete_menuItem').remove();
				}
				var a = document.createElement('div');
				a.id = "delete_menuItem";
				a.innerHTML = "Delete";
				$('#_body').append(a);
				a.style.left = event.clientX + "px";
				a.style.top = event.clientY + "px";
				// when clicked on delete context menu item, delete the selected object from canvas.
				$('#delete_menuItem').click(function(evt) {
					storm.main.deleteObjects();
					$('#delete_menuItem').css('display','none');
				});
				$('#delete_menuItem').mouseenter(function(evt) {
					$('#delete_menuItem').css('background-color','#ddd');
				});
				$('#delete_menuItem').mouseleave(function(evt) {
					$('#delete_menuItem').css('background-color','#eee');
				});
			} else { // if right click happens outside of the selected object, remove the context menu item
				if (document.getElementById('delete_menuItem')) {
					$('#delete_menuItem').remove();
				}
			}
		},
    /**
     * Listen for mouse move event and do necessary action
     * @method mouseMove
     * @param e mouseevent
     */
    mouseMove: function (event) {
        storm.eventObj = event;
        if(storm.action == 'text') return false;

        var mouse = canvas.getPointer(event.e);
        if(storm.action == 'click'){
            boardMouse.mousePointMove({
                mouse_X: mouse.x,
                mouse_Y: mouse.y
            });
            return;
        }
        if (!canvas.isDrawingMode && !canvas.isSelectMode && storm.drawShape && storm.started) {
            if(!canvas.getActiveObject()){
                storm.x = mouse.x;
                storm.y = mouse.y;
                if(!storm.shapeArgs){
                    return;
                }
                storm.shapeArgs[0].left = storm.x;
                storm.shapeArgs[0].top = storm.y;
                var bgobj = $('#color ul li.background ul li.click');
                if(bgobj.length == 0){
                    var color = '';
                }else{
                    var color = bgobj.attr('color');
                }
                var border = $('#color ul li.border ul li.click').attr('color');
                storm.shapeArgs[0].fill = color;
                storm.shapeArgs[0].stroke = border;
                storm.shapeArgs[0].width = storm.shapeArgs[0].height = 0;
                if(storm.action === 'line'){
                    var points = [mouse.x, mouse.y, mouse.x, mouse.y];
                    storm.shapeArgs[0].points = points;

                }
                drawObject(event);
                canvas.setActiveObject(canvas.item(canvas.getObjects().length-1));

            }else{
                var actObj = canvas.getActiveObject();

                var w = Math.abs(mouse.x - storm.x),
                    h = Math.abs(mouse.y - storm.y);

                if (!w || !h) {
                    return false;
                }
                if(mouse.x < storm.x){
                    actObj.set('left',mouse.x);
                }

                if(mouse.y < storm.y){
                    actObj.set('top',mouse.y);
                }

                actObj.set('width', w).set('height', h);
                storm.shapeArgs[0].uid = actObj.uid;
                storm.shapeArgs[0].object = actObj;

                if(storm.action === 'line'){
                    actObj.set({
                        x2: mouse.x,
                        y2: mouse.y
                    });
                }

                dragObject(event);
                canvas.renderAll();

            }

      }
    },
    mouseUp:function(event){
        if(storm.started) {
            storm.started = false;
        }

        if (!canvas.getActiveObject() || !storm.drawShape || storm.action == 'text' || canvas.isDrawingMode) { /* if there is no object selected on canvas simply return */
            return;
        }
        var mouse = canvas.getPointer(event.e);
        var actObj = canvas.getActiveObject();
        storm.shapeArgs[0].uid = actObj.uid;

        storm.shapeArgs[0].object = actObj;
        updateObject(event);

        storm.x = storm.y = 0;
        //storm.drawShape = false;
        //canvas.isSelectMode = true;

        canvas.renderAll();

        var newobj = util.getDefaultDataFromArray(storm.palette[storm.paletteName].shapes[storm.action].properties);
        newobj.uid = util.uniqid();
        storm.shapeArgs = [newobj];
        if(actObj.type != 'text'){
            actObj.selectable = false;
            canvas.discardActiveObject();
        }

    },
    /**
     *  Notify Server about Group Moved
     *  @method  notifyServerGroupMoved
     *  @param none
     */
    notifyServerGroupMoved: function () {
      var activeGroup = canvas.getActiveGroup();
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      storm.quickMenu.hideQuickMenuGroup();
      objectsInGroup.forEach(function (obj) {
          notifyObjModify(obj);
      });
    }
    };
    //return eve;

	function drawObject(event) {
		storm.shapeArgs[0].name = storm.action;
	    storm.shapeArgs[0].palette = storm.paletteName;
	    storm.palette[storm.paletteName].shapes[storm.action].toolAction.apply(this, storm.shapeArgs);
        storm.comm.sendDrawMsg({
	        palette: storm.paletteName,
	        action: storm.action,
	        args: storm.shapeArgs
	    });
	}

    function dragObject(event) {
        storm.shapeArgs[0].name = storm.action;
        storm.shapeArgs[0].palette = storm.paletteName;
        storm.palette[storm.paletteName].shapes[storm.action].modifyAction.apply(this, storm.shapeArgs);

    }
    function updateObject(event) {
        storm.shapeArgs[0].name = storm.action;
        storm.shapeArgs[0].palette = storm.paletteName;
        storm.palette[storm.paletteName].shapes[storm.action].modifyAction.apply(this, storm.shapeArgs);
        storm.comm.sendDrawMsg({
            palette: storm.paletteName,
            action: "modified",
            args: storm.shapeArgs
        });

    }
    function closePopup() {
      var popEl = document.getElementById('popUpDiv');
      var blanketEl = document.getElementById('blanket');
      if (popEl && popEl.style.display != 'none') popEl.style.display = 'none';
      if (blanketEl && blanketEl.style.display != 'none') blanketEl.style.display = 'none'
      $(popEl).removeClass('scale-container');
      $('div.m-submenu-list').hide();
    }

    function onObjectMoveByKey(obj) {
      canvas.renderAll();
      obj.setCoords();
      canvas.fire('object:moving', {
          target: obj
      });
      storm.quickMenu.showQuickMenu(obj);
      notifyObjModify(obj);
    }
    function notifyObjModify(obj) {
      storm.comm.sendDrawMsg({
        action: "modified",
        //name: obj.name,
        palette: obj.palette,
        args: [{
          uid: obj.uid,
          object: obj
        }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.

      });
    }
    function notifyZindexChange(obj, changType) {
      storm.comm.sendDrawMsg({
        action: "zindexchange",
        name: obj.name,
        palette: obj.palette,
        args: [{
          uid: obj.uid,
          object: obj,
          change : changType
        }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
      });
    }
});
