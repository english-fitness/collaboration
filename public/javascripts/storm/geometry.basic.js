define(["storm","storm.util"], function (storm,util){
    "use strict";
var geometry = {

    /*
     * Vector*/
    circleArc:[{
        id: "circleArc",
        self: null,

        /*
         * line object*/
        object: null,

        /*
         * line  event*/
        event:null,

        remove: false,

        /*
         *  create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            var self = this;
            var obj  =  new fabric.Circle({
                left:self.event.mouse.x,
                top:self.event.mouse.y,
                strokeWidth: 1,
                radius: 1,
                fill: '#fff',
                opacity:0.3,
                selectable: false,
                strokeDashArray: [2, 2]
            });
            canvas.add(obj);
            this.object = obj;
        },

        /*
         *  update*/
        update: function(e) {

        }
    }],

    /*
     * Vector*/
    vector:[{
        id:"line",
        self: null,
        /*
         * line object*/
        object: null,
        /*
         * line  event*/
        event:null,
        remove: false,
        /*
         * line style*/
        style:{
            name: "line",
            fill:"red",
            stroke:"red",
            strokeWidth: 1,
            selectable: false,
            strokeDashArray: [14, 13],
            type: "vector",
            palette:"shapes",
            uid:null
        },

        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            this.self.closestPoint(e,0);
            this.style.uid = util.uniqid();
            var points = [this.event.mouse.x,this.event.mouse.y,this.event.mouse.x,this.event.mouse.y];
            var defautObj = util.getDefaultDataFromArray(storm.palette['shapes'].shapes['line'].properties);
            defautObj.uid = this.style.uid;
            storm.shapeArgs = [defautObj];
            storm.shapeArgs[0].name = 'line';
            var bgobj = $('#color ul li.background ul li.click');
            if(bgobj.length == 0){
                var color = '';
            }else{
                var color = bgobj.attr('color');
            }
            var border = $('#color ul li.border ul li.click').attr('color');
            this.style.fill = color;
            this.style.stroke = border;
            storm.shapeArgs[0].style =  this.style;
            storm.shapeArgs[0].points = points;
            storm.shapeArgs[0].palette = 'shapes';
            var obj = storm.palette['shapes'].shapes['line'].toolAction.apply(this, storm.shapeArgs);
            this.object = obj;
            storm.comm.sendDrawMsg({
                palette: 'shapes',
                action: 'line',
                args: storm.shapeArgs
            });
        },

        /*
         * line update*/
        update: function(e) {
            this.event = e;
            var obj = this.object;
            if(obj) {
                this.self.drawingLines(e,obj);
                obj.set({x2: this.event.mouse.x,y2: this.event.mouse.y});
                storm.shapeArgs[0].object = obj;
                storm.palette['shapes'].shapes['line'].modifyAction.apply(this, storm.shapeArgs);
            }
        },
        getLength: function(){
            var obj = this.object;
            var w, h;
            w = Math.max(this.event.mouse.x ,obj.x1) - Math.min(this.event.mouse.x ,obj.x1);
            h = Math.max(this.event.mouse.y ,obj.y1) - Math.min(this.event.mouse.y ,obj.y1);
            return this.self.diagonalRectangle(w,h);
        },
        getArcTag: function() {
            var obj = this.object;
            var w, h;
            w = Math.max(this.event.mouse.x ,obj.x1) - Math.min(this.event.mouse.x ,obj.x1);
            h = Math.max(this.event.mouse.y ,obj.y1) - Math.min(this.event.mouse.y ,obj.y1);
            return Math.atan(h/w);
        },
        getAngle: function() {
            var obj = this.object;
            if(obj.x1 <= obj.x2)
                return this.getArcTag()/(Math.PI/180);
            return 180 - this.getArcTag()/(Math.PI/180);
        }
    },{
        id:"lineLength",
        self: null,
        /*
         * line object*/
        object: null,
        /*
         * line  event*/
        event: null,
        remove:true,
        /*
         * line style*/
        style:{
            fill: 'red',
            stroke: '#666666',
            strokeWidth: 1,
            selectable: false,
            strokeDashArray: [1, 3]
        },
        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            var obj  =  new fabric.Line([this.event.mouse.x -5,this.event.mouse.y-5,this.event.mouse.x -5,this.event.mouse.y-5],this.style);
            canvas.add(obj);
            this.object = obj;
        },
        /*
         * line update*/
        update: function(e) {
            this.event = e;
            var obj = this.object;
            if(obj)
                obj.set({x2: this.event.mouse.x -5,y2: this.event.mouse.y -5});
        }
    },{
        id:"lineVector",
        self: null,
        /*
         * line object*/
        object: null,
        /*
         * line  event*/
        event: null,
        remove:true,
        /*
         * line style*/
        style:{
            fill: 'red',
            stroke: 'red',
            strokeWidth: 0.5,
            selectable: false,
            strokeDashArray: [1, 1]
        },
        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            var border = $('#color ul li.border ul li.click').attr('color');
            this.style.stroke = this.style.fill = border;
            var obj  =  new fabric.Line([this.event.mouse.x,this.event.mouse.y,this.event.mouse.x + 50,this.event.mouse.y],this.style);
            canvas.add(obj);
            this.object = obj;
        },
        /*
         * line update*/
        update: function(e) {
            this.event = e;

        }
    },{
        id:"length",
        self: null,
        /*
         * line object*/
        object: null,

        /*
         * line  event*/
        event: null,
        remove: true,

        /*
         * line style*/
        style:{
            fontSize: 13
        },
        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;

            var self = this;
            var obj  =  new fabric.Text("",{
                fontSize: 13,
                left:self.event.mouse.x,
                top:self.event.mouse.y
            });
            canvas.add(obj);
            this.object = obj;
        },
        /*
         * line update*/
        update: function(e) {
            this.event = e;
            var obj = this.object;
            if(obj){
                var line = this.self.getVectorById("line");
                obj.set("text",""+Math.round(line.getLength())+"");
                var minX,minY;
                minX = Math.min(line.object.x1,line.object.x2);
                minY = Math.min(line.object.y1,line.object.y2);
                obj.set({top: minY + line.object.height/2 -25,left: minX + line.object.width/2 -25});
            }
        }
    },{
        id:"angle",
        self: null,
        /*
         * line object*/
        object: null,
        /*
         * line  event*/
        event: null,
        remove: true,

        /*
         * line style*/
        style:{
            fontSize: 13
        },

        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            var self = this;
            var obj  =  new fabric.Text("",{
                left:self.event.mouse.x +15,
                top:self.event.mouse.y+15,
                oldLeft:self.event.mouse.x +15,
                oldTop:self.event.mouse.y+15
            });
            canvas.add(obj);
            this.object = obj;
            basic.updateStyle(this);

        },

        /*
         * line update*/
        update: function(e) {
            this.event = e;
            var obj = this.object;
            if(obj){
                var line = this.self.getVectorById("line");
                if(line.object.y1 < line.object.y2) {
                    obj.top = obj.oldTop;
                }else{
                    obj.top = obj.oldTop - 45;
                }
                obj.set("text",""+Math.round(line.getAngle())+"\xb0");

            }
        }
    },{
        id:"center",
        self: null,
        /*
         * line object*/
        object: null,
        /*
         * line  event*/
        event: null,
        remove: true,
        /*
         * line style*/
        style:{
            fontSize: 13
        },

        /*
         * line create*/
        create: function(e,basic) {
            this.event = e;
            this.self = basic;
            var self = this;
            var obj  =  new fabric.Circle({
                left:self.event.mouse.x,
                top:self.event.mouse.y,
                strokeWidth: 1,
                radius: 1,
                fill: '#fff',
                opacity:0.3,
                selectable: false,
                strokeDashArray: [2, 2]
            });
            canvas.add(obj);
            this.object = obj;
        },

        /*
         * line update*/
        update: function(e) {
            this.event = e;
            var obj = this.object;
            if(obj){
                var line = this.self.getVectorById("line");
                if(line.object.y1 > line.object.y2) {
                    obj.piBy = 0;
                    if(line.object.x1 > line.object.x2) {
                        obj.sAngle =Math.PI + line.getArcTag();
                    }else{
                        obj.sAngle =Math.PI*2  - line.getArcTag();
                    }
                }else{
                    obj.sAngle = 0;
                    if(line.object.x1 < line.object.x2) {
                        obj.piBy =line.getArcTag();
                    }else{
                        obj.piBy = Math.PI  - line.getArcTag();
                    }
                }
                obj.radius = 20;
            }
        }
    }],

    /*
     * line create*/
    updateStyle: function(_this){
        $.each(_this.style,function(index,value){
            (_this.object).set(index,value);
        });
    },

    /*
     * diagonalRectangle*/
    diagonalRectangle: function(width,height) {
        var length = Math.pow(width,2) + Math.pow(height,2);
        return Math.sqrt(length);
    },

    /*
     * removeEvent*/
    removeEvent: function(){
        this.removeObjectVector();
        $.each(this.vector,function(index,value){
            value.object = null;
        });
    },

    /*
     * removeObjectVector*/
    removeObjectVector: function(){
        $.each(this.vector,function(index,value){
            if(value.remove == true){
                canvas.remove(value.object);
            }
        });
    },


    /*
     *  drawingLines
     *  */
    drawingLines: function(e,object) {
        var x, y,minX = Math.min(e.mouse.x,object.x1),maxX = Math.max(e.mouse.x,object.x1),maxY = Math.max(e.mouse.y,object.y1),minY = Math.min(e.mouse.y,object.y1);
        function xy(){ x = object.x1 - (object.x1 - e.mouse.x); y = object.y1;}
        function xy1(){ x = object.x1; y = e.mouse.y;}
        function xyXy(){if((maxX - minX) >= ((maxY - minY)*2)) { xy(); }else if((maxX - minX) <= ((maxY - minY)/2)){ xy1(); }else{ return false; }}
        if(e.e.altKey && object) {
            var diagonalRectangle = this.diagonalRectangle((object.x1 - e.mouse.x),(object.y1 - e.mouse.y));diagonalRectangle = Math.sqrt(Math.pow(diagonalRectangle,2)/2);
            if(e.mouse.y < object.y1) {
                y = object.y1 - diagonalRectangle;
                if(e.mouse.x > object.x1) { if(xyXy() == false){ x = object.x1 + diagonalRectangle;}}
                else{if(xyXy() == false){ x = object.x1 - diagonalRectangle; }}
            }else{
                y = object.y1 + diagonalRectangle;
                if(e.mouse.x > object.x1) {if(xyXy() == false){x = object.x1 + diagonalRectangle;}
                }else{if(xyXy() == false){ x = object.x1 - diagonalRectangle;}}
            }
            e.mouse.x = x;
            e.mouse.y = y;
        }

    },

    /*
     *  Closest Point
     *  */
    getObjectByType: function(type) {
        var typeObject = [],stt = 0;
        (canvas.getObjects()).forEach(function(val){
            if(val.type==type) {
                typeObject[stt] = val;
                stt +=1;
            }
        });
        return typeObject;
    },
    closestPoint: function(e,except) {
        var object =  this.getObjectByType("vector"),
            self = this,
            lowest = Number.POSITIVE_INFINITY,
            highest = Number.NEGATIVE_INFINITY,
            tmp,value = [];
        value.x = e.mouse.x;
        value.y = e.mouse.y;
        if(e.e.ctrlKey) {
            for(var i= 0; i<(object.length - except);i++) {
                var entry = object[i];
                tmp = compare(entry.x1,entry.y1,entry.x2,entry.y2, e);
                if (tmp.val < lowest) {
                    lowest = tmp.val;
                    if(tmp.type =="top") {
                        value.x = entry.x1;
                        value.y = entry.y1;
                    }else{
                        value.x = entry.x2;
                        value.y = entry.y2;
                    }
                };
            }
            e.mouse.x = value.x;
            e.mouse.y = value.y;
        }
        function compare(x1,y1,x2,y2,e) {
            var mouse = e.mouse,minX1,minY1,minX2,minY2,
                maxX1,maxX2,maxY1,maxY2,top,bottom,value = [];
            minX1 = Math.min(x1,mouse.x);
            maxX1 = Math.max(x1,mouse.x);
            minY1 = Math.min(y1,mouse.y);
            maxY1 = Math.max(y1,mouse.y);
            minX2 = Math.min(x2,mouse.x);
            maxX2 = Math.max(x2,mouse.x);
            minY2 = Math.min(y2,mouse.y);
            maxY2 = Math.max(y2,mouse.y);
            top = self.diagonalRectangle(maxX1-minX1,maxY1-minY1);
            bottom = self.diagonalRectangle(maxX2-minX2,maxY2-minY2);
            if(top < bottom) {
                value.type = "top";
                value.val = top;
            }else{
                value.type = "bottom";
                value.val = bottom;
            }
            return value;
        }
    },

    /*
     * getVectorById*/
    getVectorById: function(id){
        var object = null;
        $.each(this.vector,function(index,value){
            if(value.id ==id) {
                object  = value;
            }
        });
        return object;
    }
};
return geometry;
});



