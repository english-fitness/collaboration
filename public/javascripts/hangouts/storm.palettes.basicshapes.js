require(["storm", "storm.main", "storm.palettes", "storm.palettes.properties", "storm.util"], function (storm, main, palettes, objproperties, util) {
	"use strict";
	var updateProperties = function (obj, recvdObj) {
        if(recvdObj.left)
            obj.left = recvdObj.left;

        if(recvdObj.top)
            obj.top = recvdObj.top;

        if(recvdObj.scaleX)
            obj.scaleX = recvdObj.scaleX;
        if(recvdObj.scaleY)
            obj.scaleY = recvdObj.scaleY;
        if(recvdObj.width)
            obj.width = recvdObj.width;
        if(recvdObj.height)
            obj.height = recvdObj.height;
        if(recvdObj.points){
            obj.points = recvdObj.points;
        }

        if(recvdObj.x2){
            obj.x2 = recvdObj.x2;
        }

        if(recvdObj.y2){
            obj.y2 = recvdObj.y2;
        }

        if(recvdObj.angle)
            obj.setAngle(recvdObj.angle);


		if (recvdObj.fill) {
			obj.set("fill", recvdObj.fill);
		}

        if (recvdObj.strokeWidth) {
            obj.set("strokeWidth", recvdObj.strokeWidth);
        }

        if(recvdObj.textBackgroundColor){
            obj.set("textBackgroundColor", recvdObj.textBackgroundColor);
        }
		if (recvdObj.stroke) {

			obj.set("stroke", recvdObj.stroke);
		}
		if (recvdObj.text) {
			obj.text = recvdObj.text;
		}
        if (recvdObj.fontSize) {
            obj.fontSize = recvdObj.fontSize;
        }
		if(recvdObj.path)
		    obj.path = recvdObj.path;

        obj.setCoords();

    };

	palettes.registerpalette("shapes", {
	  order: 1,
		collectionName: 'shapes',
		shapes: {
            drawingpath: {
                name: "path",
                displayName: "Draw",
                activeIcon: "brush_w.png",
                inactiveIcon: "brush_g.png",
                toolAction:null,
                modifyAction: function (args) {
                    console.log('path');
                    var temp_canvas = util.getCanvasByBoardId(args.boardId);
                    var obj = util.getObjectById(args.uid,temp_canvas);
                    var recvdObj = args.object;
                    updateProperties(obj, recvdObj);
                },
                applyProperties: function (props) {
                    objproperties._applyProperties(props);
                },
                properties: [{
                    name: 'left',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("left", args.property);
                    },
                    defaultvalue: 100
                }, {
                    name: 'top',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("top", args.property);
                    },
                    defaultvalue: 100
                },	{
                    name: 'scaleX',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("scaleX", args.property);
                    },
                    defaultvalue: 1
                }, {
                    name: 'scaleY',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("scaleY", args.property);
                    },
                    defaultvalue: 1
                }, {
                    name: 'stroke',
                    type: 'string',
                    action: function (args) {
                        (args.obj).set("stroke", args.property);
                    },
                    defaultvalue: '#00FF00'
                },{
                    name: 'strokeWidth',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("strokeWidth", args.property);
                    },
                    defaultvalue: 1
                }]
            }, // end of path
            text: {
                name: "text",
                displayName: "Text",
                activeIcon: "text_w.png",
                inactiveIcon: "text_g.png",
                toolAction: function addText(args) {
                    var textVal;
                    if (args.text) {
                        textVal = args.text;
                    }else{
                        textVal = '';
                    }
                    var textSample = new fabric.Text(textVal, {
                        left: args.left,
                        top: args.top,
                        fontFamily: 'Arial',
                        angle: args.angle,
                        fill: args.fill,
                        hasControls:false,
                        scaleX: args.scaleX,
                        scaleY: args.scaleY,
                        lockRotation:true,
                        fontWeight :"100",
                        originX:'left',
                        fontSize: args.fontSize?args.fontSize:'16px',
                        textBackgroundColor:args.textBackgroundColor?args.textBackgroundColor:'#FFF',
                        showEditIcon: true

                    });
                    textSample.uid = args.uid;
                    textSample.name = "text";
                    textSample.palette = args.palette;
                    textSample.customName = "text";
                    var boardId = args.boardId;

                    util.getCanvasByBoardId(boardId).add(textSample);

                },
                modifyAction: function (args) {
                    var temp_canvas = util.getCanvasByBoardId(args.boardId);
                    var obj = util.getObjectById(args.uid,temp_canvas);
                    var recvdObj = args.object;
                    updateProperties(obj, recvdObj);

                },
                resizeAction: function (resizedObj) {
                    var obj = util.getObjectById(resizedObj.uid);
                    obj.width = resizedObj.width;
                    obj.height = resizedObj.height;
                },
                applyProperties: function (props) {
                    objproperties._applyProperties(props);
                },
                properties: [{
                    name: 'left',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("left", args.property);
                    },
                    defaultvalue: 100
                }, {
                    name: 'top',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("top", args.property);
                    },
                    defaultvalue: 100
                }, {
                    name: 'scaleX',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("scaleX", args.property);
                    },
                    defaultvalue: 1
                }, {
                    name: 'scaleY',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("scaleY", args.property);
                    },
                    defaultvalue: 1
                }, {
                    name: 'fill',
                    type: 'string',
                    action: function (args) {
                        (args.obj).set("fill", args.property);
                    },
                    defaultvalue: '#222222'
                }, {
                    name: 'stroke',
                    type: 'string',
                    action: function (args) {
                        (args.obj).set("stroke", args.property);
                    },
                    defaultvalue: '#00FF00'
                }, {
                    name: 'angle',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("angle", args.property);
                    },
                    defaultvalue: 0
                }, {
                    name: 'text',
                    type: 'string',
                    action: function (args) {
                        (args.obj).set("text", args.property);
                    },
                    defaultvalue: ''
                },{
                    name: 'strokeWidth',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("strokeWidth", args.property);
                    },
                    defaultvalue: 0
                },{
                    name: 'fontSize',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("fontSize", args.property);
                    },
                    defaultvalue: 13
                }]
            },
			rectangle: {
				name: "rectangle",
				displayName: "Rectangle",
				activeIcon: "rectangle_w.png",
				inactiveIcon: "rectangle_g.png",
				toolAction: function (args) {
                    var rect = new fabric.Rect({
						width: args.width,
						height: args.height,
						left: args.left,
						top: args.top,
						fill: args.fill,
						stroke: args.stroke,
						scaleX: args.scaleX,
						scaleY: args.scaleY,
                        strokeWidth: args.strokeWidth,
                        originX:args.originX?args.originX:"left",
                        originY:args.originY?args.originY:"top",
					});
					rect.uid = args.uid;
					rect.name = 'rectangle';
					rect.palette = args.palette;
					rect.setAngle(args.angle);
                    var boardId = args.boardId;
                    util.getCanvasByBoardId(boardId).add(rect);
				},
				modifyAction: function (args) {
                	var tem_cv = util.getCanvasByBoardId(args.boardId)
            		var obj = util.getObjectById(args.uid, tem_cv);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'width',
					type: 'number',
					action: function (args) {
						(args.obj).set("width", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'height',
					type: 'number',
					action: function (args) {
						(args.obj).set("height", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'fill',
					type: 'string',
					action: function (args) {
						(args.obj).set("fill", args.property);
					},
					defaultvalue: 0
				}, {
					name: 'stroke',
					type: 'string',
					action: function (args) {
						(args.obj).set("stroke", args.property);
					},
					defaultvalue: '#000000'
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}, {
                    name: 'strokeWidth',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("strokeWidth", args.property);
                    },
                    defaultvalue: 1
                }]
			},
			circle: {
				name: "circle",
				displayName: "Circle",
				activeIcon: "circle_w.png",
				inactiveIcon: "circle_g.png",
				toolAction: function addCircle(args) {
					var cir = new fabric.Circle({
						radius: args.radius,
						left: args.left,
						top: args.top,
                        width:args.width,
                        height:args.height,
						fill: args.fill,
						stroke: args.stroke,
						opacity: 1,
						scaleX: args.scaleX,
						scaleY: args.scaleY,
                        strokeWidth: args.strokeWidth,
                        originX:args.originX?args.originX:"left",
                        originY:args.originY?args.originY:"top",
					});
					cir.setAngle(args.angle);
					cir.uid = args.uid;
					cir.name = "circle";
					cir.palette = args.palette;
                    util.getCanvasByBoardId(args.boardId).add(cir);
				},
				modifyAction: function (args) {
                    var tem_cv = util.getCanvasByBoardId(args.boardId)
                    var obj = util.getObjectById(args.uid, tem_cv);
                    var recvdObj = args.object;
                    updateProperties(obj, recvdObj);
                    obj.radius = recvdObj.width/2;
				},
				resizeAction: function (resizedObj) {
                    var temp_canvas = util.getCanvasByBoardId(resizedObj.boardId);
					var obj = util.getObjectById(resizedObj.uid,temp_canvas);

					if (obj.width/2 == obj.radius) {
						obj.radius = resizedObj.height/2;
						obj.width = resizedObj.height;
					} else if (obj.height/2 == obj.radius) {
						obj.radius = resizedObj.width/2;
						obj.height = resizedObj.width;
					} else {
						obj.radius = resizedObj.width/2;
						obj.height = resizedObj.width;
					}
				},

				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'radius',
					type: 'number',
					action: function (args) {
						(args.obj).set("radius", args.property / args.obj.scaleX);
					},
					defaultvalue: 0
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'fill',
					type: 'string',
					action: function (args) {
						(args.obj).set("fill", args.property);
					},
					defaultvalue: ''
				}, {
					name: 'stroke',
					type: 'string',
					action: function (args) {
						(args.obj).set("stroke", args.property);
					},
					defaultvalue: '#000000'
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				},{
                    name: 'strokeWidth',
                    type: 'number',
                    action: function (args) {
                        (args.obj).set("strokeWidth", args.property);
                    },
                    defaultvalue: 1
                }]

			},
			triangle: {
				name: "triangle",
				displayName: "Triangle",
				activeIcon: "triangle_w.png",
				inactiveIcon: "triangle_g.png",
				toolAction: function addCircle(args) {
					var tri = new fabric.Triangle({
						left: args.left,
						top: args.top,
						fill: args.fill,
						stroke: args.stroke,
						scaleX: args.scaleX,
						scaleY: args.scaleY,
                        strokeWidth: args.strokeWidth,
                        originX:args.originX?args.originX:"left",
                        originY:args.originY?args.originY:"top",
					});
					tri.setAngle(args.angle)
					tri.uid = args.uid;
					tri.name = "triangle";
					tri.palette = args.palette;
                    tri.width = args.width;
                    tri.height = args.height;
                    util.getCanvasByBoardId(args.boardId).add(tri);
				},
				modifyAction: function (args) {
                    var temp_canvas = util.getCanvasByBoardId(args.boardId);
					var obj = util.getObjectById(args.uid,temp_canvas);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
				},
				resizeAction: function (resizedObj) {
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				},
				{
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				},
				{
					name: 'fill',
					type: 'string',
					action: function (args) {
						(args.obj).set("fill", args.property);
					},
					defaultvalue: '#D3DAE5'
				}, {
					name: 'stroke',
					type: 'string',
					action: function (args) {
						(args.obj).set("stroke", args.property);
					},
					defaultvalue: '#000000'
				}, {
                        name: 'width',
                        type: 'number',
                        action: function (args) {
                            (args.obj).set("width", args.property);
                        },
                        defaultvalue:0
                 }, {
                        name: 'height',
                        type: 'number',
                        action: function (args) {
                            (args.obj).set("height", args.property);
                        },
                        defaultvalue:0
                 }, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				},{
                        name: 'strokeWidth',
                        type: 'number',
                        action: function (args) {
                            (args.obj).set("strokeWidth", args.property);
                        },
                        defaultvalue: 1
                }]

			},
			// end of triangle

			line: {
				name: "line",
				displayName: "Line",
				activeIcon: "line_w.png",
				inactiveIcon: "line_g.png",
				toolAction: function (args) {
					//args.width = args.width ? args.width : 100;
					//args.height = args.strokeWidth ? args.strokeWidth : 100;
					//args.strokeWidth = args.strokeWidth ? args.strokeWidth : 100;
                    if(!args.points){
                        if(args.x1 && args.y1){
                            args.points = [args.x1, args.y1, args.x2, args.y2];
                        }else{
                            args.points = [args.left - args.width/2, args.top, args.left + args.width/2, args.top]
                        }

                    }
                    if(!args.style){
                        var line = new fabric.Line(args.points,{
                            fill: args.fill,
                            stroke: args.stroke?args.stroke:'#000000',
                            strokeWidth: args.strokeWidth,
                            top:args.top,
                            left:args.left,
                            strokeDashArray: args.strokeDashArray?args.strokeDashArray:null,
                            originX:args.originX?args.originX:"left",
                            originY:args.originY?args.originY:"top",
                        });
                    }else{
                        var line = new fabric.Line(args.points,args.style);
                    }
					line.uid = args.uid;
					line.name = 'line';
					line.palette = args.palette;
					line.setAngle(args.angle);
                    util.getCanvasByBoardId(args.boardId).add(line);

                    return line;
				},
				modifyAction: function (args) {
                    var temp_canvas = util.getCanvasByBoardId(args.boardId);
					var obj = util.getObjectById(args.uid,temp_canvas);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.strokeWidth = recvdObj.strokeWidth;
					//obj.angle = recvdObj._angle;
				},
				resizeAction: function (resizedObj) {
                    var temp_canvas = util.getCanvasByBoardId(resizedObj.boardId);
					var obj = util.getObjectById(resizedObj.uid,temp_canvas);
					obj.left = resizedObj.left;
					obj.top = resizedObj.top;
					obj.angle = resizedObj._angle;
					obj.height = resizedObj.strokeWidth;
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				},
				{
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				},
				{
					name: 'fill',
					type: 'string',
					action: function (args) {
						(args.obj).set("fill", args.property);
					},
					defaultvalue: '#000000'
				}, {
					name: 'strokeWidth',
					type: 'number',
					action: function (args) {
						(args.obj).set("strokeWidth", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				},{
                        name: 'strokeWidth',
                        type: 'number',
                        action: function (args) {
                            (args.obj).set("strokeWidth", args.property);
                        },
                        defaultvalue: 1
                 }]
			},
			importimage: {
				name: "importimage",
				displayName: "Image",
				activeIcon: "rectangle_w.png",
				inactiveIcon: "rectangle_g.png",
				toolAction: null,
				modifyAction: function (args) {
                    var temp_canvas = util.getCanvasByBoardId(args.boardId);
					var obj = util.getObjectById(args.uid,temp_canvas);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'width',
					type: 'number',
					action: function (args) {
						(args.obj).set("width", args.property / args.obj.scaleX);
					},
					defaultvalue: 200
				}, {
					name: 'height',
					type: 'number',
					action: function (args) {
						(args.obj).set("height", args.property / args.obj.scaleY);
					},
					defaultvalue: 100
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}]
			}

		} // end of shapes
	}); // end of basic shapes
	main.addTools();
});
