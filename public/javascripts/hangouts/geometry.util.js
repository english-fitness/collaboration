define(["storm"], function (storm) {
    "use strict";


    var utilGeometry = {
        /*
         * init*/
        init: function() {
            this.setKeyCode();
            this.setActionTools();
            this.actionToolsDefault();
            return this;
        },

        actionToolsDefault: function() {
            this.actionName = this.actionNameObject.existingRoads.action;
        },

        keyCode: null,

        /*
        * measureTraffic,hiddenSugar,existingRoads */
        actionName: null,

        /*
         * actionNameObject */
        actionNameObject:{
            measureTraffic:{
                action:"measureTraffic",
                keyCode:"11",
                value:'mT'
            },
            hiddenSugar:{
                action:"hiddenSugar",
                keyCode:"12",
                value:'hS'
            },
            existingRoads:{
                action:"existingRoads",
                keyCode:"13",
                value:'eR'
            },
            pathAngle: {
                action:"pathAngle",
                keyCode:"14",
                value:'pA'
            }
        },
        /*
        * setKeyCode*/
        setKeyCode: function() {
            var keyCode,_this = this;
            $(window).keydown(function(e){
                _this.keyCode = e.keyCode;
            }).keyup(function(){
                _this.keyCode = 0;
            });
            return this;
        },

        /*
         * setActionClick*/
        setActionTools: function() {
            var _this = this;
            $(document).on("click",".shape-holder",function() {
                $(this).find("ul").show();
            });
            $(document).on("click",".shape-holder ul li",function() {
                if(_this.actionNameObject[$(this).attr("name")]) {
                    $(".shape-holder ul li").removeClass("selected");
                    $(this).addClass("selected");
                    _this.actionName = _this.actionNameObject[$(this).attr("name")].action;

                }
            });
            $("body").click(function(e){
                if($(e.target).attr("class")!="vector") {
                    $(".shape-holder ul").hide();
                }
            });
            return this;
        }
    }
    return utilGeometry.init();
});



