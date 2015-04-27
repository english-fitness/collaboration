define(["storm", "storm.util", "math.util"], function(storm, util, mathUtil) {

    var quickMenu = {
        init: function() {
            bindEvents();
        },

        showQuickMenu: function(selectedObj) {
            if(selectedObj.name == 'text' || selectedObj.latex) {
                $('#edit_icon').show();
                if(selectedObj.text != ''){
                    $('div.m-quick-edit').show();
                }else{
                    $('div.m-quick-edit').hide();
                }
            } else {
                $('#edit_icon').hide();
            }

            if(selectedObj.name != 'image' || !storm.user.canChangeInvisibleImage()) {
                $('#visible_icon').hide();
            } else {
                if(selectedObj.opacity == 0 || selectedObj.opacity == util.INVISIBLE_OPACITY) {
                    $('#visible_icon').attr('class', 'invisible-icon');
                } else {
                    $('#visible_icon').attr('class', 'visible-icon');
                }
                $('#visible_icon').show();
            }
            if($('.load-text-box').is(':visible')){
                $('div.m-quick-edit').hide();
            }
            $('div.m-quick-edit').show();

            var left  = selectedObj.oCoords.tl.x;
            var top = selectedObj.oCoords.tl.y;
            var scrollLeft = document.getElementById("containerDiv").scrollLeft;
            var scrollTop = document.getElementById("containerDiv").scrollTop;
            var xpos = left - scrollLeft > 40 ? left - scrollLeft : 40;
            var ypos = top - scrollTop > 40 ? top - scrollTop : 40;
            $('div.m-quick-edit').offset({ top: ypos, left: xpos });
        },

        hideQuickMenu: function (){
            $('div.m-quick-edit').hide();
        },

        showQuickMenuGroup: function(selectedGroup) {
            var quickMenu = $('div.m-quick-edit-group');
            quickMenu.show();
            var left  = selectedGroup.oCoords.tl.x;
            var top = selectedGroup.oCoords.tl.y;
            var scrollLeft = document.getElementById("containerDiv").scrollLeft;
            var scrollTop = document.getElementById("containerDiv").scrollTop;
            var xpos = left - scrollLeft > 40 ? left - scrollLeft : 40;
            var ypos = top - scrollTop > 40 ? top - scrollTop : 40;
            quickMenu.offset({ top: ypos, left: xpos });
        },

        hideQuickMenuGroup: function (){
            $('div.m-quick-edit-group').hide();
        },
    };

    function bindEvents() {
        $('div.m-quick-edit').on("click", "span", function(event) {
            var item = $(this).attr('class');
            switch(item) {
            case 'edit-icon':
                quickMenu.hideQuickMenu();
                var actionObject = canvas.getActiveObject();
                if(actionObject.type && actionObject.type =="text")
                    return util.textForm(canvas.getActiveObject());
                if(actionObject.latex != "")
                    return mathUtil.createMathEditor(actionObject.latex);
                break;
            case 'delete-icon':
                storm.main.deleteObjects();
                quickMenu.hideQuickMenu();
                break;
            case 'visible-icon':
                var obj = canvas.getActiveObject();
                obj.setOpacity(0);
                storm.main.sendModifiedObject();
                $('#visible_icon').removeClass('visible-icon').addClass('invisible-icon');
                util.displayImage(obj);
                break;
            case 'invisible-icon':
                var obj = canvas.getActiveObject();
                obj.setOpacity(1);
                storm.main.sendModifiedObject();
                $('#visible_icon').removeClass('invisible-icon').addClass('visible-icon');
                util.displayImage(obj);
                break;
            }
        });

        $('div.m-quick-edit-group').on("click", "span", function(event) {
            var item = $(this).attr('class');
            switch(item) {
            case 'delete-icon':
                storm.main.deleteObjects();
                quickMenu.hideQuickMenuGroup();
                break;
            }
        });
    }

    return quickMenu;
});