/** storm.util **/
define(["storm", "underscore"], function (storm, _) {
    "use strict";
    return {
     /* Throws Error if the value is null. */
        assertNotNull: function (value, str) {
            if (value === null || (value.palette) === null || (value.name) === null) {
                throw new Error(str);
                canvas.activeObject = null;
                return false;
            }
            return true;
        },
        getMode: function (){
            var url = window.location.href;
            var mode=url.substring(url.indexOf('mode')+4,url.indexOf('mode')+5);
            return mode;
        }
        ,

        /**
         * Validation method for input field, checks for the user keypress and allows only numbers
         * @method numbersonly
         * @param myfield, e, dec
         */
        numbersonly : function (myfield, e, dec) {
            var key;
            var keychar;

            if (window.event) {
                key = window.event.keyCode;
            } else if (e) {
                key = e.which;
            } else {
                return true;
            }
            keychar = String.fromCharCode(key);

            // control keys
            if ((key === null) || (key === 0) || (key === 8) || (key === 9) || (key === 13) || (key === 27)) {
                return true;
            } else if ((("0123456789").indexOf(keychar) > -1)) {    // numbers
                return true;
            } else if (dec && (keychar === ".")) {  // decimal point jump
                myfield.form.elements[dec].focus();
                return false;
            } else {
                return false;
            }
        },

        /**
         * Validation method for input field, checks for the user keypress and allows only letters
         * @method letternumber
         * @param e
         */
        letternumber : function (e) {
            var key;
            var keychar;

            if (window.event) {
                key = window.event.keyCode;
            } else if (e) {
                key = e.which;
            } else {
                return true;
            }
            keychar = String.fromCharCode(key);
            keychar = keychar.toLowerCase();

            // control keys
            if ((key === null) || (key === 0) || (key === 8) || (key === 9) || (key === 13) || (key === 27)) {
                return true;
            } else if ((("abcdefghijklmnopqrstuvwxyz0123456789").indexOf(keychar) > -1)) {  // alphas and numbers
                return true;
            } else {
                return false;
            }
        },

        /**
         * Calculate width of the given text string and return it
         * @method getStringWidth
         * @str
         */
        getStringWidth: function (str) {
            var font = '20px delicious_500',
                obj = $('<div id=div1>' + str + '</div>')
                    .css({'position': 'absolute', 'float': 'left', 'white-space': 'pre-wrap', 'visibility': 'hidden', 'font': font})
                    .appendTo($('body')),
                w = document.getElementById('div1').clientWidth;
            obj.remove();
            return w;
        },

        /**
         * Calculate height of the given text string and return it
         * @method getStringHeight
         * @param str
         */
        getStringHeight: function (str) {
            var font = '20px delicious_500',
                obj = $('<div id=div1>' + str + '</div>')
                    .css({'position': 'absolute', 'float': 'left', 'white-space': 'pre-wrap', 'visibility': 'hidden', 'font': font})
                    .appendTo($('body')),
                h = document.getElementById('div1').clientHeight;
            obj.remove();
            return h;
        },

        /**
         * Returns unique id to attach to an object
         * @method uniqid
         * @param null
         */

        uniqid: function () {
            var newDate = new Date();
            return this.randomString() + newDate.getTime();
        },
        /**
         * Returns Random String
         * @method randomString
         * @param null
         */
        randomString: function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            var i = 0;
            for (i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            return randomstring;
        },
        /**
         * Calculate the offset value for the canvas and return it
         * @method getOffset
         * @param el
         */
        getOffset: function(el) {
            var _x = 0;
            var _y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return {
                top: _y,
                left: _x
            };
        },
        /**view form text*/
        textForm: function(objs){
            $('div.m-quick-edit').hide();
            var slt_font_size ='<select id="choose-font" class="effect-obj" name="font-size" style="width: 35px;">'+this.for_select_num(6,30,objs.fontSize)+'</select>';
            var textarea = '<textarea id="inputsometext" class="effect-obj" uid="'+objs.uid+'" name="text" style="resize:both;color:'+objs.stroke+';min-height:20px; padding: 5px; min-width:50px;line-height:'+(objs.fontSize+1)+'px;  overflow:hidden;font-size:'+objs.fontSize+'px;font-family:'+objs.fontFamily+';width:'+(objs.currentWidth +10)+'px; min-width:150px; height: '+(objs.currentHeight +13)+'px; ">'+objs.text+'</textarea>';
            var html = '<span class="effect-obj" style="position:absolute;top:'+(objs.oCoords.bl.y - objs.currentHeight)+'px; left: '+(objs.oCoords.bl.x-5)+'px;z-index:999999;"><div class="effect-obj" style="position: relative">';
            html +='<div class="effect-obj" style="position: absolute; top: -20px; left: 0px;">';
            html +=slt_font_size;
            html +="</div>";
            html +=textarea;
            html +='</div></span>';

            $(".load-text-box").html(html);

            setTimeout(function(){
                $(".load-text-box").show();
                $('.load-text-box textarea').focus();
            },300);
        },
        /**
         *  When receive a notification from server to modify the other side when it gets modified.
         *  @method  modifyObject
         *  @param args - received object and object's id.
         */
        scalingForm: function(objs){
            objs.setCoords();
            $("#canvasId .load-text-box span").css({"top":(objs.oCoords.bl.y - objs.currentHeight -9)+"px","left":(objs.oCoords.bl.x - 5)+"px"});
            $("#canvasId .load-text-box textarea").css({"line-height":(objs.fontSize +1)+"px","font-size":objs.fontSize+"px","width":(objs.currentWidth + 10)+"px","height":(objs.currentHeight + 10)+"px"});
        },
        getCanvasByBoardId: function(boardId){

            if(!boardId) boardId = storm.currentBoardId;

            var canvasId = $("#boards-tab ul li[data-holder="+boardId+"]").attr('data');

            if(!canvasId){
                return canvas;
            }
            var canvas_temp = null;

            if(!storm.canvases[canvasId]){
                canvas_temp = storm.canvases[canvasId] = new fabric.Canvas(canvasId, {backgroundImageStretch: false});
            }else{
                canvas_temp = storm.canvases[canvasId];
            }
            if(!canvas_temp){
                return canvas;
            }

            // window.canvas = canvas_temp;
            return canvas_temp;
            // return canvas;
        },
        changeText: function(obj){
            var textareaObj = $('.load-text-box textarea');
            var targetObj = $(obj);
            if($(".load-text-box").is(':visible') && !targetObj.hasClass('effect-obj')){
                var uid = textareaObj.attr("uid");
                var obj = this.getObjectById(uid,canvas);
                if(!obj){
                    return;
                }
                var font_size = textareaObj.parents(".load-text-box").find("select[name='font-size']").val();
                this.scalingForm(obj);
                var value = textareaObj.val();
                if($.trim(value)==""){
                    this.removeAnObj(obj);
                    return;
                }
                obj.set('text',value);
                obj.set('fontSize',parseInt(font_size));

                storm.drawText =  false;
                storm.modifyText = true;
                $(".load-text-box").hide();
                setTimeout(function(){$('.s-pointer').click()},200);
                canvas.renderAll();
                //-----------
                storm.comm.sendDrawMsg({ // Notify about this to server
                    action: "modified",
                    name: obj.name,
                    palette: obj.palette,
                    path: obj.path,
                    args: [{
                        uid: obj.uid,
                        object: obj
                    }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
                });
                storm.drawText =  false;
                storm.modifyText = true;
                $(".load-text-box").hide();
            }
        },
        /**select num for*/
        for_select_num: function (a,b,c){
            var html;
            var e;
            var select = "";
            for(e=a;e<=b;e++){
                if(e==c){
                    select = 'selected="selected"';
                }else{
                    select = "";
                }
                html +='<option class="effect-obj" value="'+e+'" '+select+'>'+e+'</option>';
            }
            return html;
        },
        /**
         * Searches for the object with the given id and returns that object
         * @property id
         * @type object
         */
        getObjectById:function (id, canvas_temp) {
            if(canvas_temp == undefined) canvas_temp = canvas;
            var obj;
            var objs = canvas_temp.getObjects();
            objs.forEach(function (object) {
                if (object.uid === id) {
                    obj = object;
                }
            });
            return obj;
        },
        /**
         * Searches canvas to check if an Image is present
         */
        checkForImage:function () {
            var objs = canvas.getObjects();
            var imageFound = false;
            objs.forEach(function (object) {
                if (object.type === 'image') {
                    imageFound = true;
                }
            });
            return imageFound;
        },
        /**
         *  Creates an proeperties object from a  given array and returns that object
         *  @method  getDefaultDataFromArray
         *  @param arr - Array of properties
         *  @return obj - Object
         */
        getDefaultDataFromArray: function (arr) {
            if (arr === undefined) {
                return null;
            }
            var obj = {};
            var i = 0;
            for (i = 0; i < arr.length; i++) {
                obj[arr[i].name] = arr[i].defaultvalue;
            }
            return obj;
        },
        /**
         *  Get properties from a given object and returns an object with the extracted property values.
         *  @method  getPropertiesFromObject
         *  @param arr - Array of properties
         *  @param fromObj - Object from which the properties are to be extracted
         *  @return obj - Object
         */
        getPropertiesFromObject: function (arr, fromObj) {
            if (arr === undefined) {
                return null;
            }
            var obj = {};
            var i = 0;
            for (i = 0; i < arr.length; i++) {
                obj[arr[i].name] = fromObj[arr[i].name];
            }
            obj['height'] = fromObj['height'];
            obj['width'] = fromObj['width'];
            obj['paths'] = fromObj['paths'];
            return obj;
        },

        INVISIBLE_OPACITY: 0.2,

        displayImage: function(obj) {
            if(obj.opacity == 0 || obj.opacity == this.INVISIBLE_OPACITY) {
                obj.opacity = storm.user.canViewInvisibleImage() ? this.INVISIBLE_OPACITY : 0;
            }
            canvas.renderAll();
        },

        removeAnObj:function(obj){
            canvas.remove(obj);
            canvas.renderAll();
            console.log('remove obj');
            storm.comm.sendDrawMsg({
                action: "delete",
                args: [{
                    uid: obj.uid
                }]
            });
        },
        parseQuery: function(qstr)
        {
            var query = {};
            var a = qstr.split('&');
            for (var i in a)
            {
                var b = a[i].split('=');
                query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
            }

            return query;
        },
        updateURLParameter: function(url, param, paramVal){
            var newAdditionalURL = "";
            var tempArray = url.split("?");
            var baseURL = tempArray[0];
            var additionalURL = tempArray[1];
            var temp = "";
            if (additionalURL) {
                tempArray = additionalURL.split("&");
                for (i=0; i<tempArray.length; i++){
                    if(tempArray[i].split('=')[0] != param){
                        newAdditionalURL += temp + tempArray[i];
                        temp = "&";
                    }
                }
            }

            var rows_txt = temp + "" + param + "=" + paramVal;
            return baseURL + "?" + newAdditionalURL + rows_txt;
        },

        isAllowBoard: function(boardId) {
			//change according to board setting change
            var students = storm.dataBoards[boardId].students;
			if (!students){
				students = [];
			}
            if(storm.user.role == storm.roles.STUDENT && _(students).size() > 0
                && _(students).contains(storm.user.userId)) {
                return false;
            }
            else {
                return true;
            }
			// if(!storm.sync && storm.user.role == storm.roles.STUDENT && _(students).size() > 0
                // && !_(students).contains(storm.user.userId)) {
                // return false;
            // }
            // else {
                // return true;
            // }
        }
    };

});