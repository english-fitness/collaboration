define(["storm", "storm.main", "storm.ui", "storm.util","math.util", "board.mouse", "underscore"], function (storm, main, ui, util,math, boardMouse, _) {
    "use strict";
    return {
        registerpalette : function (paletteName, paletteDesc) {
            storm.palette[paletteName] = paletteDesc;
        },
         /**
         * Loop through all palettes and call createPallette for each palette found
         * @method createAllPallettes
         * @param paletteObj
         */
        createAllPallettes: function (paletteObj) {
            //Rendering Palettes
            var paletteArray = [];
            var paletteName;
            for (paletteName in paletteObj) {
              paletteArray.push({"name": paletteName, "order": paletteObj[paletteName]["order"]});
            }
            paletteArray.sort(function(a,b){return a["order"]- b["order"]});
            for(var i=0;i< paletteArray.length;i++) {
                this.createPallette(paletteArray[i]["name"]);
            }

            this.turnOnPalettes();

        },

        turnOnPalettes: function() {
            this.turnOffPalettes();
            //Event handler for the Shape Click
            $(".shape-holder").on('click',function(e){

                var shapeEle = $(this),shapeSelected,obj;
                $(".load-text-box").hide();
                if(shapeEle!=null){
                     shapeSelected = $(shapeEle).data().shape;
                     ui.resetShapeSelection();
                     $(shapeEle).addClass("shape-selected");
                     storm.$currShape = shapeEle;
                     canvas.isSelectMode = false;
                     canvas.isDrawingMode = false;


                     storm.action = shapeSelected;
                     if (storm.action == "math") {
                         return false;
                     }
                     if (storm.action == "path") {
                         storm.pathMode = true;
                         storm.eraseMode = false;
                         storm.highlightMode = false;
                         canvas.freeDrawingBrush.width = 1;
                         canvas.freeDrawingBrush.color = ($("#color ul li.border ul li.click").length > 0)?$("#color ul li.border ul li.click").attr('color'):'#000';
                     }else if(storm.action == "eraser") {
                         storm.action = shapeSelected = "path";
                         storm.currentCanvas.style.cursor = 'crosshair';
                         canvas.isDrawingMode = true;
                         storm.pathMode = false;
                         canvas.freeDrawingBrush.width = storm.eraserSize;
                         canvas.freeDrawingBrush.color = storm.eraserCorlor;

                         storm.eraseMode = true;
                         storm.highlightMode = false;
                         // return;
                     }else if(storm.action == "highlight") {
                         storm.eraseMode = false;
                         storm.highlightMode = true;
                         storm.pathMode = false;
                         storm.action = shapeSelected = "path";
                         storm.currentCanvas.style.cursor = 'crosshair';
                         canvas.isDrawingMode = true;

                         canvas.freeDrawingBrush.width = storm.highlightSize;
                         canvas.freeDrawingBrush.color = storm.highlightCorlor;

                         //return;
                     }

                     if('pointer' === shapeSelected){
                         canvas.isSelectMode = true;
                         storm.drawShape = false;
                         canvas.selection = true;

                         var objAll = canvas.getObjects();
                         $.each(objAll,function(index,value){
                             value.selectable = true;
                         });

                         return;
                     }else{
                         canvas.isSelectMode = false;
                         canvas.selection = false;

                         var objAll = canvas.getObjects();

                         $.each(objAll,function(index,value){
                             value.selectable = false;
                         });

                     }
                     if('click' === shapeSelected){
                         storm.currentCanvas.style.cursor = 'images/pointer.png';//'pointer';
                         boardMouse.mousePointStart({
                             action:'start'
                         });
                         return;
                     }else{
                         boardMouse.mousePointStart({
                             action:'stop'
                         });
                     }

                     storm.currentCanvas.style.cursor = 'default';
                     if('text' === shapeSelected){
                         storm.drawText = true;
                         storm.modifyText = true;
                         storm.currentCanvas.style.cursor = 'text';
                     }else{
                         storm.drawText = storm.modifyText = false;
                     }
                     storm.drawShape = true;

                     storm.paletteName = "shapes";//$(shapeEle).parent().data().palettename;
                     if (shapeSelected !== "path" && shapeSelected !== "eraser" && shapeSelected !== "highlight") {
                         if(!storm.palette[storm.paletteName].shapes[shapeSelected]){
                             return;
                         }
                         obj = util.getDefaultDataFromArray(storm.palette[storm.paletteName].shapes[shapeSelected].properties);
                         obj.uid = util.uniqid();
                         storm.shapeArgs = [obj];
                     }
                     if (storm.action !== "path") {
                         canvas.isDrawingMode = false;
                     } else {
                         storm.currentCanvas.style.cursor = 'crosshair';
                         canvas.isDrawingMode = true;
                         //return;
                     }
                     //canvas.renderAll();
                }
            });
        },

        turnOffPalettes: function() {
            $(".shape-holder").off('click');

            $('.shape-holder').removeClass('shape-selected');
            storm.action = "";

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
        },

        /* Create Vector action*/

        vectorAction: function() {
            return '<div class="shape-holder" id="vector-shape" title="Geometry" data-shape="vector"><div class="basic-shape s-vector"></div></div>';
        },

        /* mathTools*/

        mathTools: function() {
            return '<div class="shape-holder" id="math-shape"  title="Math" data-shape="math"><div class="basic-shape s-math"></div></div>';
        },
        asyncTool: function() {
            return '<div class="shape-holder" id="sync-shape" title="sync-async" data-shape="async"><div class="basic-shape s-sync">Async</div></div>';
        },

        /**
         * Create a  palette for each type of palette and add it in toolbar
         * @method createPallette
         * @param paletteName
         */
        createPallette: function (paletteName) {

            var paletteName = storm.palette[paletteName].collectionName,shapesObj,html="",i,shape,shapeName,shapeDisplayName,shapeHolder;

            if('shapes' == paletteName) html = '<div class="shape-holder"  id="pointer-shape" data-shape="pointer" title="Select"><div class="basic-shape s-pointer"></div></div><div class="shape-holder" data-shape="click" title="Highlight Pointer"><div class="basic-shape s-click"></div></div>'+
                '<div class="shape-holder" id="highlight-shape" title="Markup" data-shape="highlight"><div class="basic-shape s-highlight"></div></div>';
            ui.updateAccordian(paletteName);
            shapesObj = storm.palette[paletteName];
            for (i in shapesObj.shapes) {
                shape = shapesObj.shapes[i];
                shapeName = shape.name;
                shapeDisplayName = shape.displayName;

                if(shapeName == "importimage") continue;

                shapeHolder = '<div class="shape-holder" id="'+shapeName+'-shape" title="'+shapeDisplayName+'" data-shape="'+shapeName+'"><div class="basic-shape s-'+shapeName+'"></div></div>';
                html += shapeHolder;
            }
            html += '<div class="shape-holder" id="eraser-shape" title="Eraser" data-shape="eraser"><div class="basic-shape s-eraser"></div></div></div>';
            // html +='</div>';
            html += this.vectorAction();
            html += this.mathTools();
            $("#"+paletteName).append(html);

        }
        };
});


