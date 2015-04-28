define(["storm", "storm.util"], function(storm, util) {
    var boardExport = {
        init: function() {
            bindEvents();
        }
    };

    function bindEvents() {
        $('#export .board-icon-export').click(function() {
            $("#boards").append("<canvas id='export_canvas'></canvas>");
            var exportCanvas = document.getElementById("export_canvas");
            exportCanvas.height = $('#canvasId').height();
            exportCanvas.width = $('#canvasId').width();

            var context = exportCanvas.getContext("2d");

            var pdfCanvans = document.getElementById("pdf"+storm.currentBoardId);
            if(pdfCanvans) {
                var imgPdf = new Image();
                imgPdf.src = pdfCanvans.toDataURL('image/png');
                context.drawImage(imgPdf, 0, 0);
            }

            var currentCanvas = util.getCanvasByBoardId(storm.currentBoardId);
            var img = new Image();
            img.src = currentCanvas.toDataURL('image/png');
            context.drawImage(img, 0, 0);

            var img = exportCanvas.toDataURL("image/png");
            var name = 'daykem123.png';

            if(window.navigator.userAgent.match("Chrome")) {
                $('<a>').attr({href:img,download:name})[0].click();
            } else {
                img = img.replace("image/png", "image/octet-stream");
                window.open(img);
            }

            $('#export_canvas').remove();

        });
    }

    return boardExport;
});