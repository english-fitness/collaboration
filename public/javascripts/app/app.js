define(["jquery", "jquery-ui", "jquery.rating", "storm", "licode.client", "jquery.mousewheel", "jquery.mCustomScrollbar", "jquery.form", "jquery.slimscroll", "jquery.cookie",
	"pdfjs", "socket.io", "fabric","bootstrap", "storm.setup","mathquill"], function($, storm, licode) {
	$(document).ready(function() {
		PDFJS.workerSrc = baseUrl +'javascripts/thirdparty/pdfjs/pdf.worker.js';
		$('#containerDiv').show();
		$('#loading').css('top',$(window).height()/2);
		$('#loading').show();
		$('#form_upload').ajaxForm(function(data) {
		});

        $('.listChat').slimScroll({
            "width":$(".rightdiv").width(),
            alwaysVisible: true
        });

        window.onbeforeunload = function() {
            if(!storm.reloadConfirm) return;
        	if(window.navigator.language == 'vi') {
        		return 'Bạn đang trong lớp học đang diễn ra!';
        	} else {
        		return 'You are in a happening session';
        	}
        };

        window.onunload = function() {
        	// disconnect from whiteboard and licode
        	storm.comm.socket.emit('bye');
        	licode.stop();
        };

        L.Logger.setLogLevel(L.Logger.INFO);

    });
});