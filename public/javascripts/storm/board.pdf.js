define(["storm", "storm.ui"], function (storm, ui) {
    var boardPdf = {
        init: function(numpage) {
            storm.comm.socket.on('loadPdf', function (data) {
                boardPdf.renderPdf(data);
            });

            storm.comm.socket.on("changePage",function(data) {
                storm.currentBoardPage[data.boardId] = data.docPage;
                storm.currentPages[data.boardId] = data.docPage;
                gotoPage(data.docPage,data.boardId);
            });

            storm.comm.socket.on('changeScale', function (data) {
                if(data.docScale)
                    changeScale(data.docScale, data.boardId);
            });
            bindEvents();
        },
        loadPdfOnBoard: function(boardId) {
            var dataBoard =  storm.dataBoards[boardId];
            if((dataBoard && dataBoard.docUrl) || storm.loadedPdf[boardId]) {
                var dataObj = {};
                dataObj.docUrl = dataBoard.docUrl;
                dataObj.docPage = dataBoard.docPage?dataBoard.docPage:1;
                dataObj.docScale = dataBoard.docScale?dataBoard.docScale:1;
                dataObj.boardId = boardId;
                storm.currentPages[boardId] = dataObj.docPage;
                boardPdf.renderPdf(dataObj);
            }
        },
        renderPdf: function(data){
            if(!data.docUrl || !data.boardId) return false;
            if(storm.sync){
                ui.resizeWindow();
                ui.showLoading();
            }

            try{
                PDFJS.getDocument(data.docUrl+'x').then(function(pdf){
                    ui.hideLoading();
                    if(!pdf){
                        alert('Unexpected error happened, Please try again later!');
                        return false;
                    }
                    boardPdf.addFiles && boardPdf.addFiles(data.docUrl);

                    // Using promise to fetch the page
                    storm.pdfObj[data.boardId] = pdf;
                    storm.totalPages[data.boardId] = pdf.numPages;
                    storm.loadedPdf[data.boardId] = data.docUrl;
                    storm.currentScale[data.boardId] = data.docScale;

                    var cP = (storm.currentPages[data.boardId] > 0)?storm.currentPages[data.boardId]:1;
                    $('.navication .currentPage').val(cP);
                    $('.navication .totalPage').html(storm.totalPages[data.boardId]);

                    boardPdf.appendPagination(pdf.numPages);

                    if(data.docPage && parseInt(data.docPage) > 0){
                        gotoPage(parseInt(data.docPage),data.boardId);
                    }else{
                        gotoPage(1,data.boardId);
                    }
                },function(error){
                    if(error){
                        ui.hideLoading();
                        alert('There was an error with the uploaded file, please try gain!')
                    }
                });
            }catch(ex){
                ui.hideLoading();
            }

            return storm.pdfObj;

        },

        appendPagination: function(num) {
            var nav = buildPagination(num);
            $("#boards #nav").html(nav);
        },

        addFiles: undefined

    };

    function gotoPage(index,boardId) {
        if(!storm.pdfObj[boardId]){
            var data = storm.dataBoards[boardId];
            try{
                PDFJS.getDocument(data.docUrl).then(function(pdf){
                    if(!pdf){
                        ui.hideLoading();
                        alert('Unexpected error happened, please try again later!');
                        return false;
                    }
                    // Using promise to fetch the page
                    storm.pdfObj[data.boardId] = pdf;
                    storm.totalPages[data.boardId] = pdf.numPages;
                    storm.loadedPdf[data.boardId] = data.docUrl;

                    var cP = (storm.currentPages[data.boardId] > 0)?storm.currentPages[data.boardId]:1;

                });
            }catch(ex){
                ui.hideLoading();
            }

        }
        if(storm.pdfObj[boardId])
            storm.pdfObj[boardId].getPage(index).then(function(page) {
                if(storm.processingPdf){
                    return false;
                }else{
                    storm.processingPdf = true;
                }

                ui.hideLoading();
                canvas.clear();
                storm.boards.sendLoadBoard({
                    boardId: boardId,
                    page:index
                });
                storm.currentBoardPage[boardId] = index;
                storm.currentPages[boardId] = index;
                var scale = 1;
                if(storm.currentScale[boardId] && parseFloat(storm.currentScale[boardId]) > 0){
                    scale = parseFloat(storm.currentScale[boardId]);
                }else{
                    scale = (canvas.width/page.getViewport(1.0).width);
                }
                storm.currentScale[boardId] = scale;
                var real_percent =  scale*100;
                real_percent = Math.round(real_percent);
                if(boardId == storm.currentBoardId){
                    $('ul.navication .currentPage').val(index);
                    $('input.c-percent').val(real_percent);
                }

                var viewport = page.getViewport(scale);
                storm.canvasHeights[boardId] = viewport.height;

                ui.resizeWindow();
                //
                // Prepare canvas using PDF page dimensions
                //
                //viewport.height = canvas.height;
                $('#pdf'+boardId).remove();
                var nameBoard  = $("#boards ul li[data-holder="+boardId+"]").attr('data');
                if($('#pdf'+boardId).length == 0){
                    $('#'+nameBoard).parent().prepend("<canvas id='pdf"+boardId+"'></canvas>")
                }

                //$('.canvas-container').css('height',viewport.height)
                var canvas_pdf = $('#pdf'+boardId)[0];

                var context_pdf = canvas_pdf.getContext('2d');
                canvas_pdf.height = viewport.height;
                canvas_pdf.width = viewport.width;

                //$('#pdf'+storm.currentBoardId).attr('height',canvas.height);
                //
                // Render PDF page into canvas context
                //
                var renderContext = {
                    canvasContext: context_pdf,
                    viewport: viewport
                };
                //page.cleanData();
                page.render(renderContext);
                storm.processingPdf = false;
            });
    }

    function changeScale(newScale, boardId) {
        storm.currentScale[boardId] = newScale;
        gotoPage(storm.currentBoardPage[boardId],boardId);
    }

    function zoomPage(percent){
        percent = parseInt(percent);
        percent = (percent>200)?200:percent;
        percent = (percent<50)?50:percent;
        var newScale  = percent/100;
        changeScale(newScale,storm.currentBoardId);
        sendChangeScale(newScale);

    }

    function sendChangePage(page) {
        var data = {boardId: storm.currentBoardId, docPage:page};
        storm.comm.socket.emit("changePage", storm.parentBoardId, data);
    }

    function sendChangeScale(scale) {
        var data = {boardId: storm.currentBoardId, docScale:scale};
        storm.comm.socket.emit("changeScale", storm.parentBoardId, data);
    }

    function bindEvents() {
        $("#boards").on("click",".navication .nextPage",function() {
            var currentPage  = $(this).parent().find(".currentPage").val();
            currentPage = parseInt(currentPage);
            if(currentPage < parseInt($(this).parent().find('.totalPage').html())) {
                var CurrentPageNext = currentPage+1;
                sendChangePage(CurrentPageNext);
                gotoPage(CurrentPageNext,storm.currentBoardId);
                $(this).parent().find("select.currentPage").val(CurrentPageNext);
            }
        });
        $("#boards").on('change','select.currentPage',function(e) {
            var page = $(this).val();
            page = parseInt(page);
            if(page > 0) {
                sendChangePage(page);
                gotoPage(page,storm.currentBoardId);
            }
        });

        $("#boards").on("click",".navication ._zoonOut",function() {
            var percentInput = $(this).parent().find(".c-percent");
            var current_percent  = parseInt(percentInput.val());
            current_percent = current_percent;
            var current_percent = current_percent+5;
            zoomPage(current_percent);

        });

        $("#boards").on("click",".navication ._zoonIn",function() {
            var percentInput = $(this).parent().find(".c-percent");
            var current_percent  = parseInt(percentInput.val());
            current_percent = current_percent;
            var current_percent = current_percent-5;
            zoomPage(current_percent);

        });

        $('#boards').on('keypress','.c-percent',function(e) {
            if(e.which != 8 && isNaN(String.fromCharCode(e.which))) {
                e.preventDefault();
            }
            if(e.keyCode == 13) {
                var percent = parseInt($(this).val());
                zoomPage(percent);
            }

        });

        $("#boards").on("click",".navication .prevPage",function() {
            var currentPage  = $(this).parent().find(".currentPage").val();
            currentPage = parseInt(currentPage);
            if(currentPage >1) {
                var CurrentPagePrev = currentPage-1;
                sendChangePage(CurrentPagePrev);
                gotoPage(CurrentPagePrev,storm.currentBoardId);
                $(this).parent().find(".currentPage").val(CurrentPagePrev);
            }
        });
    }

    function buildPagination(num) {
        var nav = '<ul class="navication">' +
                        '<li class="_zoonIn"><a href="javascript:void(0)">-</a></li>' +
                        '<li class="_currentPercent"><input type="text" class="c-percent" name="percent" value="100" />%</li>' +
                        '<li class="_zoonOut"><a href="javascript:void(0)">+</a></li>' +
                        '<li class="prevPage"><a href="javascript:void(0)">Prev</a></li>' +
                        '<li class="currentPage">'+ getSelectBox(storm.currentPages[storm.currentBoardId],num)+'</li>/<li class="totalPage">'+num+'</li>' +
                        '<li class="nextPage"><a href="javascript:void(0)">Next</a></li>' +
                   '</ul>';
        return nav;
    }

    function getSelectBox(currentPage, totalPage) {
         var options = getOptions(currentPage,totalPage);
         return '<select class="currentPage">'+options+'</select>';
    }

    function getOptions(currentPage, totalPage) {
        var options = '';
        for(var idx =1; idx <= totalPage; idx++){
            if(idx == currentPage){
                options += '<option selected="selected" value="'+idx+'">'+idx+'</option>'
            }else{
                options += '<option value="'+idx+'">'+idx+'</option>'
            }
        }
        return options;
    }

    return boardPdf;
});