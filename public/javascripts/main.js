requirejs.config({
    "paths": {
        "app": "../app/app",
        "erizo": "../thirdparty/erizo",
        "jquery": "../thirdparty/jquery/jquery-2.1.4.min",
		"jquery-ui" : "../thirdparty/jquery/jquery-ui.min",
		"jquery.rating": "../thirdparty/jquery/jquery.rating",
        "jquery.mousewheel": "../thirdparty/jquery/jquery.mousewheel.min",
        "jquery.mCustomScrollbar": "../thirdparty/mscrollbar/jquery.mCustomScrollbar",
        "jquery.form": "../thirdparty/jquery/jquery.form",
        "jquery.slimscroll": "../thirdparty/jquery/jquery.slimscroll.min",
        "jquery.cookie": "../thirdparty/jquery/jquery.cookie",
        "bootstrap": "../thirdparty/bootstrap/bootstrap.min",
		"bootstrap-dialog": "../thirdparty/bootstrap/bootstrap-dialog.min",
        "fabric": "../thirdparty/fabric/fabric",
        "socket.io": "../thirdparty/socket.io",
        "pdfjs": "../thirdparty/pdfjs/pdf",
        "underscore": "../thirdparty/underscore-min",
        "mathquill": "../thirdparty/mathquill/mathquill",
        "webrtcsupport": "../thirdparty/webrtcsupport.bundle"
    },
    "shim": {
        "jquery": {exports: "jQuery"},
        "jquery.mousewheel": {deps: ['jquery']},
        "jquery.mCustomScrollbar": {deps: ['jquery']},
        "jquery.form": {deps: ['jquery']},
        "jquery.slimscroll": {deps: ['jquery']},
        "jquery.cookie": {deps: ['jquery']},
        "brain": {deps: ['jquery']},
        "bootstrap": {deps: ['jquery']},
        "mathquill": {deps: ['jquery']}
    }
});
requirejs(["app"]);