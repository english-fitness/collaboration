define(["storm", "storm.ui", "storm.util", "storm.fabric", "storm.palettes", "storm.events", "storm.palettes.properties",
    "storm.comm","../components/ui.imaginea.accordion","boards","board.files","geometry.tools"],
    function (storm, ui, util, mfabric, palettes, events,  properties, comm, CustomAccordion,boards,boardFiles,geometry) {
    "use strict";
    var main = {
        /**
         * Initializes the application
         * @method main.init
         * @param none
         *
         */
        init: function () {
        },

        /**
         *  Check for the active object or group object and remove them from canvas
         *  @method  deleteObjects
         *  @param none
         */
        replaceAllString: function(find,replace,str){
            return str.split(find).join(replace);
        },
        deleteObjects: function () {
            var activeObject = canvas.getActiveObject(),
                activeGroup = canvas.getActiveGroup();

            if (activeObject) {
                canvas.remove(activeObject);
                storm.comm.sendDrawMsg({
                    action: "delete",
                    args: [{
                        uid: activeObject.uid
                    }]
                });
            } else if (activeGroup) {
                var objectsInGroup = activeGroup.getObjects();
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function (object) {
                    canvas.remove(object);
                    storm.comm.sendDrawMsg({
                        action: "delete",
                        args: [{
                            uid: object.uid
                        }]
                    });
                });
            }
        },
        modifyObject: function (args) {

            var tem_cv = util.getCanvasByBoardId(args[0].boardId)
            var obj = util.getObjectById(args[0].uid, tem_cv);
            try{
                if (obj) {
                    if (tem_cv.getActiveGroup()) {
                        tem_cv.deactivateAllWithDispatch();
                        tem_cv.renderAll();
                    }
                    storm.palette[obj.palette].shapes[obj.name].modifyAction ? storm.palette[obj.palette].shapes[obj.name].modifyAction.apply(this, args) : null;
                    obj.setCoords(); // without this object selection pointers remain at orginal postion(beofore modified)
                }
                canvas.renderAll();
            }catch(e) {
                if (console && console.error) {
                    console.error("Problems with modifyObject" + e);
                }
            }
        },
        sendModifiedObject: function() {
            var objActive = canvas.getActiveObject();
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
        },
        /**
         * Draw free-hand drawing path when notification received from server
         * @method drawPath
         * @param args
         */
        drawPath: function (args,cv) {
            var p = new fabric.Path(args.path);
            p.fill = null;
            p.stroke = args.stroke;
            p.strokeWidth = args.strokeWidth;
            p.uid = args.uid;
            p.name = "drawingpath";
            p.scaleX = 1;
            p.scaleY = 1;
            p.palette = "shapes";
            p.set("left", args.left);
            p.set("top", args.top);
            p.originX = args.originX ? args.originX : "left";
            p.originY = args.originY ? args.originY : "top";
            p.angle = args.angle ? args.angle : 0;

            p.set("width", args.width);
            p.set("height", args.height);
            cv.add(p);
            cv.renderAll();
            p.setCoords();
        },
        /**
         *  Handle MouseMove and MouseDown events - when user trying to draw a shape on canvas
         *  @method  handleMouseEvents
         *  @param none
         */
        addTools: function () {
            palettes.createAllPallettes(storm.palette);
            new CustomAccordion({
                "cntrId":"accordion",
                "headerClass":"p-header",
                "sectionClass":"p-cntr",
                "headerOpenClass":"p-open",
                "headerCloseClass":"p-close"
            });


            $('#toolsdiv').append("<div id='deleteTool' class='tools deleteTool'></div>");
            $('#deleteTool').click(function () {
                main.deleteObjects();
            });
        },
        /**
         *  Called when other users add, modify or delete any object
         *  @method  storm.onDraw
         *  @param data - shape(data.shape) and args array (data.args)
         *
         */
        commOnDraw: function () {
            comm.prototype.onDraw =  function (data) {
                if (data && data.args) {
                    data.args[0].boardId = data.boardId;
                    var temp_canvas = util.getCanvasByBoardId(data.boardId);
                    if (data.action === undefined || data.action === null) {
                        return;
                    }
                    switch(data.action) {
                        case "modified":
                            storm.main.modifyObject(data.args);
                            break;
                        case "drawpath":
                            storm.main.drawPath(data.args[0],temp_canvas);
                            break;
                        case "delete":
                            var obj = util.getObjectById(data.args[0].uid,temp_canvas);
                            var activeObj = temp_canvas.getActiveObject();
                            temp_canvas.remove(obj);
                            if (activeObj == obj) {
                                storm.quickMenu.hideQuickMenu();
                            }
                            break;
                        case "importimage":
                            storm.main.addImageToCanvasFromServer(data.args[0]);
                            break;
                        case "zindexchange":
                            var obj = util.getObjectById(data.args[0].uid,temp_canvas);
                            if(data.args[0].change === 'forward') {
                                temp_canvas.bringForward(obj);
                                temp_canvas.renderAll();
                            } else {
                                temp_canvas.sendBackwards(obj);
                                temp_canvas.renderAll();
                            }
                            break;
                        case "uploadLayout":
                            storm.main.addLayoutToCanvasFromServer(data.args[0]);
                            break;
                        default:
                            if (storm.palette[data.palette] !== undefined){
                                storm.palette[data.palette].shapes[data.action].toolAction.apply(this,data.args);//data.args
                                canvas.renderAll();
                            }
                    }

                    if(data.action == "image" && !data.args[0].latex ) {
                        boardFiles.addFiles(data.args[0].src);
                    }
                }
            };
        },
        /**
         * Adding image to canvas when data received from Server
         * @method addImageToCanvasFromServer
         * @param args - image source and other properties
         */
        addImageToCanvasFromServer : function(args) {
            var img = new Image();
            img.onload = function() {
                args.image = this;
                args.width = this.width;
                args.height = this.height;
                storm.main.addImageToCanvas(args);
            }
            /* args.src - image source as dataURL */
            img.src = args.src;
        },

        /**
         * Adding layout to canvas when data received from Server
         * @method addLayoutToCanvasFromServer
         * @param args - image source and other properties
         */
        addLayoutToCanvasFromServer: function (args) {
            var img = new Image();
            img.onload = function() {
                args.image = this;
                args.width = this.width;
                args.height = this.height;
                storm.main.addLayoutToCanvas(args);
            }
            /* args.src - image source as dataURL */
            img.src = args.src;
        },

        /**
         * Adding layout to canvas as a background image when user selects a layout image from local storage
         * @method addLayoutToCanvas
         * @param args - image source and other properties
         */
        addLayoutToCanvas: function (args) {
            /* args.image - HTML Element */
            var fabImage = new fabric.Image(args.image, {
                width: args.width,
                height: args.height
            });
            canvas.setBackgroundImage(args.src, function() {
                canvas.renderAll();
            });
            fabImage.uid = args.uid;
            fabImage.name = args.name;
            fabImage.palette = args.palette;
            if(args.self) {
                args.self = false;
                storm.comm.sendDrawMsg({
                    action: 'uploadLayout',
                    palette: fabImage.palette,
                    args: [{
                        uid: fabImage.uid,
                        name: fabImage.name,
                        image:args.image,
                        src:args.src,
                        palette: args.palette
                    }]
                });
            }
        },
        /**
         * Adding image to canvas when user selects an image from local storage
         * @method addImageToCanvas
         * @param args - image source and other properties
         */
        addImageToCanvas : function (args) {
            /* args.image - HTML Element */
            var fabImage = new fabric.Image(args.image, {
                left: args.left,
                top: args.top,
                width: args.width,
                height: args.height,
                scaleX: args.scaleX,
                scaleY: args.scaleY
            });
            canvas.add(fabImage);
            fabImage.uid = args.uid;
            fabImage.name = args.name;
            fabImage.palette = args.palette;
            if(args.angle) fabImage.setAngle(args.angle);
            canvas.renderAll();
            fabImage.setCoords();
            if(args.self) {
                args.self = false;
                storm.comm.sendDrawMsg({
                    action: 'importimage',
                    palette: fabImage.palette,
                    args: [{
                        uid: fabImage.uid,
                        left: fabImage.left,
                        top: fabImage.top,
                        width: fabImage.width,
                        height: fabImage.height,
                        scaleX: fabImage.scaleX,
                        scaleY: fabImage.scaleY,
                        name: fabImage.name,
                        image:args.image,
                        src:args.src,
                        palette: args.palette
                    }]
                });
            }
        }
    }; // end of 'return'
    main.commOnDraw();
    return main;
});
