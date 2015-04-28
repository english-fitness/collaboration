define(["storm", "storm.ui", "storm.util"], function(storm, ui, util) {
    var lastScrollTop = 0, lastScrollLeft = 0, scrollEvent = true, scrollTimer;
    var boardScroll = {
        init: function() {
            storm.comm.socket.on("viewport", function (data) {
                preventSendingViewport();                
                setViewport(data);
            });

            bindEvents();
        },

        setScrollLeft: function(scrollLeft) {
            preventSendingViewport();
            $('#containerDiv').scrollLeft(scrollLeft),
            ui.resizeWindow();
        },

        setScrollTop: function(scrollTop) {
            preventSendingViewport();
            $('#containerDiv').scrollTop(scrollTop),
            ui.resizeWindow();
        }
    };

    function bindEvents() {
        $('#containerDiv').bind('scroll',function () {
            $('div.m-quick-edit').hide();
            canvas.discardActiveObject();
            ui.resizeWindow();

            if(scrollEvent) {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(sendViewport, 10);
            }
            
        });
    }

    function sendScroll() {
        var data = {
            scrollTop: $('#containerDiv').scrollTop(), 
            scrollLeft: $('#containerDiv').scrollLeft(),
            boardId:storm.currentBoardId
        };

        storm.comm.socket.emit("setScroll", storm.parentBoardId, data);
    }

    function setViewport(data) {
        var scrollTop = $('#containerDiv').scrollTop();
        var scrollLeft = $('#containerDiv').scrollLeft();
        var width = $('#containerDiv').width();
        var height = $('#containerDiv').height();

        switch(data.direction) {
        case 'up':
            if(data.y1 < scrollTop) $('#containerDiv').scrollTop(data.y1);
            break;
        case 'down':
            if(data.y2 > (scrollTop + height)) $('#containerDiv').scrollTop(data.y2 - height);
            break;
        case 'left':
            if(data.x1 < scrollLeft) $('#containerDiv').scrollLeft(data.x1);
            break;
        case 'right':
            if(data.x2 > (scrollLeft + width)) $('#containerDiv').scrollLeft(data.x2 - width);
            break;
        }
    }

    function preventSendingViewport() {
        scrollEvent = false;
        setTimeout(function() {
            scrollEvent = true;
        }, 50);
    }

    function sendViewport() {
        var scrollTop = $('#containerDiv').scrollTop();
        var scrollLeft = $('#containerDiv').scrollLeft();
        var width = $('#containerDiv').width();
        var height = $('#containerDiv').height();
        var direction = "";


        if(scrollTop > lastScrollTop) {
            direction = "down";
        } else if(scrollTop < lastScrollTop) {
            direction = "up";
        }

        if(scrollLeft > lastScrollLeft) {
            direction = "right";
        } else if(scrollLeft < lastScrollLeft) {
            direction = "left";
        }

        lastScrollTop = scrollTop;
        lastScrollLeft = scrollLeft;

        // top-left
        var x1 = scrollLeft, y1 = scrollTop;
        // right-bottom
        var x2 = width + scrollLeft, y2 = height + scrollTop;


        if(direction != "") {
            var data = {direction: direction, x1: x1, y1: y1, x2: x2, y2: y2};
            storm.comm.socket.emit("viewport", storm.parentBoardId, data);
        }

    }

    return boardScroll;
});