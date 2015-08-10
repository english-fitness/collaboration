define(["storm", "storm.ui", "storm.util", "board.pdf"], function(storm, ui, util, boardPdf) {
	var uploadedFiles = {}, root = "", currentPath = "", allowImageExtensions = ["gif", "jpeg", "jpg", "png", "bmp"];
    var boardFiles = {
		init: function() {
            boardPdf.addFiles = this.addFiles;

			bindEvents();
		},

		addFiles: function(file) {
            var files = storm.dataBoards[storm.parentBoardId].files;
            if(files == undefined || !_(files).isArray()) files = [];
		    if(!_(files).contains(file))
			    files.push(file);
            storm.dataBoards[storm.parentBoardId].files = files;
	    }
	};

    function sendLoadPdf(data) {
        storm.comm.socket.emit("loadPdf", storm.parentBoardId, data);
    }

	function uploadImage(data) {
        if(!data.docUrl) return false;
        var imgObj = util.getDefaultDataFromArray(storm.palette['components'].shapes['image'].properties);
        imgObj.uid = util.uniqid();
        storm.shapeArgs = [imgObj];
        storm.shapeArgs[0].name = 'image';
        storm.shapeArgs[0].src = $.trim(data.docUrl);
        storm.shapeArgs[0].source = $.trim(data.docUrl);
        storm.shapeArgs[0].left =  100;
        storm.shapeArgs[0].top = 100;
        storm.shapeArgs[0].boardId = data.boardId;
        storm.shapeArgs[0].palette = 'components';
        storm.shapeArgs[0].opacity = 1;
        storm.palette['components'].shapes['image'].toolAction.apply(this, storm.shapeArgs);
        storm.comm.sendDrawMsg({
	        palette: 'components',
	        action: 'image',
	        boardId:data.boardId,
	        args: storm.shapeArgs
        });
        ui.hideLoading();

        boardFiles.addFiles(data.docUrl);
    }

    function drawFileBox(folderPath) {
        currentPath = folderPath;

        $('.list-files').empty();

        var breadcrumbPath = "";
        var breadcrumb = '<a href="">home</a>';
        var paths = folderPath.split("/");
        var folder = uploadedFiles;

        _(paths).each(function(path) {
            if(path != "") {
                breadcrumbPath += "/" + path;
                breadcrumb += ' / ' + '<a href="'+breadcrumbPath+'">'+path+'</a>';
                folder = folder[path];
            }
        });
        $('#reusefiles .path-folder').html(breadcrumb);
        _(folder).each(function(value, key) {
             if(_(value).isObject()) {
                var pathThisFolder = folderPath+'/'+key;
                $('.list-files').append('<li><div class="board-icon-folder"></div><a class="load-folder" href="'+pathThisFolder +'">'+key+'</a></li>');
             }
        });

        _(folder).each(function(value, key) {
            if(_(value).isString()) {
                var extension = value.substr(value.lastIndexOf('.') + 1).toLowerCase();
                if(extension == 'pdf'){
                    $('.list-files').append('<li><div class="board-icon-pdf"></div><a class="load-pdf-file" href="'+root + value +'">'+key+'</a></li>');
                }
            }
        });

        _(folder).each(function(value, key) {
            if(_(value).isString()) {
                var extension = value.substr(value.lastIndexOf('.') + 1).toLowerCase();
                if($.inArray(extension,allowImageExtensions) != -1){
                    $('.list-files').append('<li><div class="board-icon-image"></div><a class="load-picture-file" href="'+ root + value +'">'+key+'</a></div></li>');
                }
            }
        });

    }

	function bindEvents() {

        $('#reusefiles .path-folder').on('click', 'a', function(e) {
            e.preventDefault();
            var folderPath = $(this).attr('href');
            drawFileBox(folderPath);
        });
        $('#reusefiles .list-files').on('click','.load-folder',function(e){
            e.preventDefault();
            var folderPath = $(this).attr('href');
            drawFileBox(folderPath);
        });

		$('#reusefiles .list-files').on('click','.load-pdf-file',function(e){
            e.preventDefault();
            var url = $(this).attr('href');
            var dataObj = {};
            dataObj.docUrl = url;
            dataObj.docPage = 1;
            dataObj.docScale = 1;
            dataObj.boardId = storm.currentBoardId;
            sendLoadPdf(dataObj);
            storm.loadedPdf[storm.currentBoardId] = url;
            boardPdf.renderPdf(dataObj);
            $('#uploadModal').modal('hide');
        });

		$('#reusefiles .list-files').on('click','a.load-picture-file',function(e){
            e.preventDefault();
	        $('#myModal').modal('hide');
            var dataObj = {};
	        dataObj.docUrl = $(this).attr('href');
	        dataObj.boardId = storm.currentBoardId;
            uploadImage(dataObj);
            $('#uploadModal').modal('hide');
        });

        $('#reusefiles .list-files').on('click','.board-icon-close',function(e){
            var path = $(this).prev().attr('href');
            if(path == undefined) return;
            var data = { path: path };
            var parent = $(this).parent();
            $.post(baseUrl + 'removefile', data)
            .done(function(data) {
                if(data.success){
                    // parent.remove();
                    parent.fadeOut(300, function() { parent.remove(); })
                } else {
                    alert('Unexpected error happened');
                }
            });

        });

        $('#download_docs').click(function(e){
            if(storm.user.role == storm.roles.STUDENT && storm.sessionStatus != 2) {
                alert('You can only download document once the class is ended');
                return;
            }

	        var files = storm.dataBoards[storm.parentBoardId].files;
	        $('.list-docs').empty();
	        $('.list-images-board').empty();
	        for(var index in files){
		        var fileName = files[index].split('/');
		        fileName = fileName[fileName.length - 1];
		        var extension = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
		        if(extension == 'pdf'){
			        $('.list-docs').append('<li><div class="board-icon-pdf"></div><a class="file-download" target="_blank" href="'+files[index] +'">'+fileName+'</a></li>');
		        }else{
			        if($.inArray(extension,allowImageExtensions) != -1)
				        $('.list-images-board').append('<li><div class="board-icon-image"></div><a class="file-download" target="_blank" href="'+files[index] +'">'+fileName+'</a></li>');
		        }
	        }
            $('#downloadModal').modal('show');
        });

        $('#upload_pdf_image').on('click',function() {
            if(_(uploadedFiles).isEmpty()) {
                $.get(baseUrl+'listuploaded', function(docs) {
                    var files = docs['files'];
                    if(files && _(files).isObject) {
                        uploadedFiles = files;
                        pathPdf = "";
                        root = docs['path'];
                        drawFileBox("");
                    }

                }, 'json');
            } else {
                drawFileBox(currentPath);
            }
        });

		$('#insertLinkUrl').click(function(){
            var file_url = $('#file_url').val();
            if(!file_url) return false;
            var imgObj = util.getDefaultDataFromArray(storm.palette['components'].shapes['image'].properties);
            imgObj.uid = util.uniqid();
            storm.shapeArgs = [imgObj];
            storm.shapeArgs[0].name = 'image';
            storm.shapeArgs[0].src = file_url;
            storm.shapeArgs[0].source = file_url;
            storm.shapeArgs[0].left =  100;
            storm.shapeArgs[0].top = 100;
            if($('#value_scale').val()){
                storm.shapeArgs[0].scale = $('#value_scale').val()/100;
            }else{
                storm.shapeArgs[0].scale = 1;
            }

            storm.shapeArgs[0].palette = 'components';
            storm.palette['components'].shapes['image'].toolAction.apply(this, storm.shapeArgs);
            storm.comm.sendDrawMsg({
                palette: 'components',
                action: 'image',
                args: storm.shapeArgs
            });

            boardFiles.addFiles(file_url);
        });

		var uploadOps = {
            beforeSubmit: function(arr, $form, options) {
                ui.showLoading();
            },
            success:function(data) {
                if(data.success == false){
                    ui.hideLoading();
                    alert('Cannot upload file, reason: '+ data.reason);
                    return false;
                }
                var dataObj = {};
                dataObj.docUrl = data.url;
                dataObj.docPage = 1;
                dataObj.docScale = 1;
                var return_url = data.url;
                dataObj.boardId = storm.currentBoardId;
                var arrs = return_url.split(".");
                boardFiles.addFiles(data.url);
                if(arrs[arrs.length-1].toLowerCase() == 'pdf'){
                    sendLoadPdf(dataObj);
                    storm.loadedPdf[storm.currentBoardId] = dataObj.docUrl;
                    boardPdf.renderPdf(dataObj);
                }else{
                    uploadImage(dataObj);
                }

            },
            error:function(){
                ui.hideLoading();
                return false;
            }
        };

        $('#form_upload_docs').ajaxForm(uploadOps);
	}

	return boardFiles;
});