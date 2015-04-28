define(["storm","storm.util","geometry.basic","geometry.util"], function (storm,util,geometryBasic,utilGeometry) {
    "use strict";
    /*
    * geometry[action].onMouseDown();
    * geometry[action].onMouseMove();
    * geometry[action].onMouseUp();
    * */
    var geometry = {
        /*
        * action vector
        * */
        vector:{
            /*
             * setObjectVector;
             * */
            setObject: function(e) {
                var line = geometryBasic.getVectorById("line");
                this.measureTraffic(line);
                this.hiddenSugar(line);
                this.existingRoads(e,line);
                this.pathAngle();
            },

            /*
             * pathAngle;
             * */
            pathAngle: function() {
                var lineLength = geometryBasic.getVectorById("lineLength"),
                length = geometryBasic.getVectorById("length"),
                line = geometryBasic.getVectorById("line");
                if(utilGeometry.actionName =="pathAngle") {
                    lineLength.remove = false;
                    length.remove = false;
                    line.remove  = true;
                }else{
                    lineLength.remove = true;
                    length.remove = true;
                    line.remove  = false;
                }
            },

            /*
             * measureTraffic;
             * */
            measureTraffic: function(object) {
                if(utilGeometry.actionName =="measureTraffic") {
                    object.remove = true;
                }else{
                    object.remove = false;
                }
            },

            /*
             * existingRoads;
             * */
            existingRoads: function(e,object) {
                if(e.e.shiftKey){
                    object.style.strokeDashArray = ["2","2"];
                }else{
                    object.style.strokeDashArray = null;
                }
            },



            /*
             * hiddenSugar;
             * */
            hiddenSugar: function(object) {
                if(utilGeometry.actionName =="hiddenSugar") {
                    object.style.strokeDashArray = ["2","2"];
                }else{
                    object.style.strokeDashArray = null;
                }
            },

             /*
             * tools[action].onMouseDown();
            * */
            onMouseDown: function(e) {
                this.setObject(e);
                (geometryBasic.vector).forEach(function(entry) {
                    entry.create(e,geometryBasic);
                });
                canvas.renderAll();
            },

            /*
             * tools[action].onMouseMove();
             * */
            onMouseMove: function(e) {
                (geometryBasic.vector).forEach(function(entry) {
                    var obj = entry.update(e);
                });
                canvas.renderAll();
            },

            /*
             * tools[action].onMouseUp();
             * */
            onMouseUp: function(e) {
                geometryBasic.closestPoint(e,1);
                geometryBasic.getVectorById("line").update(e);
                this.vectorEmit();
                geometryBasic.removeEvent();
                canvas.renderAll();
            },

            /*
             * Comm;
             * */
            vectorEmit: function() {
                (geometryBasic.vector).forEach(function(entry) {
                    var obj = entry.object;
                    if(entry.remove == false) {
                        storm.shapeArgs[0].object = obj;
                        storm.palette['shapes'].shapes['line'].toolAction.apply(this, storm.shapeArgs);
                        storm.comm.sendDrawMsg({
                            palette: 'shapes',
                            action: 'modified',
                            args: storm.shapeArgs
                        });
                    }
                });
            }
        },

        /*
        * circleArc*/
        circleArc:{

            /*
            * geometry['circleArc'].onMouseDown()*/
            onMouseDown: function(e) {
                (geometryBasic.circleArc).forEach(function(entry) {
                    entry.create(e,geometryBasic);
                });
                canvas.renderAll();
            },

            /*
             * geometry['circleArc'].onMouseMove()*/
            onMouseMove: function(e) {
                (geometryBasic.circleArc).forEach(function(entry) {
                    entry.update(e);
                });
                canvas.renderAll();
            },

            /*
             * geometry['circleArc'].onMouseUp()*/
            onMouseUp: function(e) {
                geometryBasic.removeEvent();
                canvas.renderAll();
            }
        }
     }
    return geometry;
});



