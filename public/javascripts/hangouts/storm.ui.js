define(["storm", "bootstrap-dialog"], function (storm, BootstrapDialog) {
	"use strict";
	var ui = {
		/** width and height of panels for resize */
		bodyWidth: null,
		bodyHeight: null,
		initialBodyWidth: $(window).width() > 700 ? $(window).width() : 700,
        //initialBodyWidth: $(window).width() > 960 ? $(window).width() : 960,
		initialBodyHeight: $(window).height() > 800 ? $(window).height() : 800,
		topPanelHeight: null,
		leftPanelWidth: null,
		leftPanelHeight: null,
		accordionContentHeight: null,
		canvasWidth: null,
		canvasHeight: null,
		deviceWidth: $(window).width() > 700 ? $(window).width() : 700,
        //deviceWidth: $(window).width() > 1000 ? $(window).width() : 1000,
		deviceHeight: null,
		deiviceInnerHeight: null,
		deviceInnerWidth: null,
		/**
		 * function to initialize width and heights
		 * @method initWidthAndHeightOfPanels
		 * @param none
		 */
		initWidthAndHeightOfPanels: function () {
			//this.bodyWidth = $(window).width() - 2;
			//this.bodyHeight = $(window).height();
			this.topPanelHeight = 100;
			this.leftPanelWidth = 80;
			//this.leftPanelHeight = this.bodyHeight - this.topPanelHeight;
			//this.canvasWidth = 800;//this.bodyWidth - this.leftPanelWidth;
			//this.canvasHeight = 600;//this.bodyHeight - this.topPanelHeight - 23;
		},
		/**
		 * method to resize panels on resize of browser window
		 * @method resizeWindow
		 * @param none
		 */
		resizeWindow: function () {
			this.resizeBody();
			this.resizeHeader();
			this.resizeMainPanel();
			this.resizeLeftPanel();
			this.resizeCanvas();
            this.resizeRightDiv();
		},
		/**
		 * method to resize the document body
		 * @method resizeBody
		 * @param none
		 */
        resizeRightDiv: function(){
            var windowHeight = $(window).height()-63;
            var videoHeight  = $("#webcam").height();
            var friendHeight = $("#friendsicon").height();
            var textboxHeight= $(".ui-widget-content #chat").height();
            var chatHeight   = parseInt(windowHeight)-(parseInt(videoHeight)+parseInt(friendHeight)+parseInt(textboxHeight));
            $(".ui-widget-content .listChat").height(chatHeight);
            $(".slimScrollDiv").height(chatHeight);
            $(".listChat").scrollTop($(".listChat #chattext").height());
        },
		resizeBody: function () {
			//$('#_body').width(this.bodyWidth + 2);
			//$('#_body').height(this.bodyHeight);
		},

		/**
		 * method to set header width and height
		 * @method resizeHeader
		 * @param none
		 */
	    resizeHeader: function () {
			//$('#header').width(this.bodyWidth);
			//$('#header').height(this.topPanelHeight);
		},
		/**
		 * Set Outer panel width and height
		 * @method resizeMainPanel
		 * @param none
		 */
		resizeMainPanel: function () {
			//$('#outer').height(this.leftPanelHeight);
			//$('#outer').width(this.bodyWidth);
		},
		/**
		 * Set left panel width and height
		 * @method resizeLeftPanel
		 * @param none
		 */
		resizeLeftPanel: function () {
			//$('#leftdiv').width(this.leftPanelWidth);
			$('#leftdiv').height($(window).height());
		},
		/**
		 * Set Canvas width and height
		 * @method resizeCanvas
		 * @param none
		 */
	    resizeCanvas: function () {
            var rightPanelWidth = $(".rightdiv").width();
			//$('#containerDiv').height($(window).height() - this.topPanelHeight - 23);
            $("#boards-tab").width($(window).width() - (42+rightPanelWidth));
			$('#containerDiv').height($(window).height()-30);
            $('#containerDiv').width($(window).width() - (42+rightPanelWidth));
            //$('#containerDiv').width($(window).width() - (this.leftPanelWidth + rightPanelWidth));
            $('.rightdiv').height($(window).height());
            //$('#containerDiv').width($(window).width() - (this.leftPanelWidth + rightPanelWidth));
            var fixHeightDevice = 0;
            var fixHeightCanvas = 0;
            if(storm.canvasHeights[storm.currentBoardId]){
                fixHeightDevice = parseInt(storm.canvasHeights[storm.currentBoardId]);
                fixHeightCanvas = parseInt(storm.canvasHeights[storm.currentBoardId]);
            }else{
                fixHeightDevice = this.deviceHeight;
                fixHeightCanvas = this.canvasHeight;
            }
            $('#containerBody').height(fixHeightDevice); //Should be set to container height and width
			//$('#containerBody').width(this.deviceWidth);
			//$('#canvasId').height(this.deviceInnerHeight); //Should be set to container inner height and width
            $('#canvasId').height(fixHeightDevice);
            $('#canvasId').width(this.deviceInnerWidth+80); //deviceInnerWidth
			canvas.setDimensions({width: parseInt(this.deviceInnerWidth)+80, height: fixHeightCanvas});
			this.resizeBoardTabs();
		},

		resizeBoardTabs: function() {
			var width = $("#boards-tab").width() - 60;
			var totalTabs = $('#boards-tab ul li').length;
			var tabWidth = width/totalTabs - 1;
			if(tabWidth > 140) tabWidth = 140;
			$('#boards-tab ul li').width(tabWidth);
		},

		/**
		 * Bind resizing of window to panels
		 * @method bindResizeWindow
		 * @param none
		 */
		bindResizeWindow: function () {
			var thisObj = this;
			$(window).resize(function () {
				thisObj.initWidthAndHeightOfPanels();
			    thisObj.resizeWindow();
			    //thisObj.setCanvasSize();
				thisObj.drawHVLines();
			});
		},
		/**
		 *  Reset Current seltected tool Icon when object is drawn on canvas
		 *  @method  resetIconSelection
		 *  @param none
                 *
		 *  TODO -- This method is obselete, should be removed in near future
		 */
		resetIconSelection: function () {
			if (storm.$currActiveIcon) {
				storm.$currActiveIcon.attr("src", storm.$currActiveIcon.attr('data-inactive'));
				storm.$currActiveIcon.parent().parent().removeClass('shape-active');
			}
		},
		/**
		 *  Reset Current seltected shape
		 *  @method  resetShapeSelection
		 *  @param none
		 *
		 */

		resetShapeSelection:function(){
			if (storm.$currShape) {
				storm.$currShape.removeClass('shape-selected');
			}
		},
		/**
		 * Sets the Canvas width and height based on browser window size
		 * @method setCanvasSize
		 * @param none
		 *
		 */
		setCanvasSize: function () {
			var width = this.canvasWidth;
			var height = this.canvasHeight;
			canvas.setDimensions({width: width, height: height});
		},

        showLoading: function(){
            storm.showingLoad = true;
            $('#myModal').modal('hide');
            $('#loading').show();
        },

        hideLoading: function(){
            storm.showingLoad = false;
            $('#loading').hide();
        },
        showDisconnecting: function(){
            $('body').append('<div class="modal-backdrop fade in disconnecting"><div class="alert-reconnecting">' +
	            '<b style="color: red">Oops!!!</b><br/>' +
	            '1. There was an error happened with the Internet connection <br />' +
	            '2. System will try to reconnect <br /> ' +
	            '3. Please <span style="color: red">refresh, reload (Press F5)</span> if it takes too long <br>' +
	            '4. Call our support team if the problem still persists <br>' +
	            '<b>Support Hotline: </b> <span style="color: red;">0961.00.50.57</span> <br>' +
	            'Error Code: NO#1</div></div>');
        },
        showMediaDisconnecting: function(){
	        $('body').append('<div class="modal-backdrop fade in disconnecting"><div class="alert-reconnecting">' +
		        '<b style="color: red">Oops!!!</b><br/>' +
		        '1. There was an error happened with the Internet connection <br />' +
		        '2. System will try to reconnect <br /> ' +
		        '3. Please <span style="color: red">refresh, reload (Press F5)</span> if it takes too long<br>' +
		        '4. Call our support team if the problem still persists <br>' +
		        '<b>Support Hotline: </b> <span style="color: red;">0961.00.50.57</span> <br>' +
		        'Error Code: MEDIA#2</div></div>');
        },
		showForceEndSession: function(){
			$('body').append('<div class="modal-backdrop fade in disconnecting"><div class="alert-reconnecting">\
		        <b style="color: red">Session has ran out of time</b><br/>\
				This session has ran out of time and will be terminated. You can still enter view only mode.\
				<br>In view only mode, you are not be able to use the audio or video communication or using the whiteboard.\
				<br>The browser will reload and enter view-only mode in a few seconds.\
				<br>If you have any problem or concern, please contact with our customer supports.\
		        <b>Support Hotline: </b> <span style="color: red;">0961.00.50.57</span> <br>\
				</div></div>');
		},
        hideDisconnecting: function(){
            $('body .modal-backdrop').remove();
        },
		showSurveyForm: function(){
			if (storm.user.isTeacher()){
				window.onbeforeunload = function(){
					return  'Please fill in the reminders for this session before leaving\nIf you can\'t do it now, please do it later. '+
							'You can access unfilled reminders from your main account screen.';
				};
				
				var surveySubmitSuccess = new BootstrapDialog({
					title:'Thank you',
					message:'Thank you for completing the session. This page will now reload and switch to view only mode.',
					closable:false,
					autodestroy:true,
					buttons:[
						{
							label:'Close',
							action:function(dialog){
								dialog.close();
								window.onbeforeunload = null;
								window.location.reload();
							}
						}
					],
				});
				
				var surveySubmitFailed = new BootstrapDialog({
					title:'Error',
					message:'There were unexpected errors happened. The reminders were not saved. This window will now close, please add the reminders later',
					closable:false,
					autodestroy:true,
					buttons:[
						{
							label:'Close',
							action:function(dialog){
								dialog.close();
								window.onbeforeunload = null;
							}
						}
					],
				});
				
				var surveyDialog = new BootstrapDialog({
					id:'surveyForm',
					title:'Session Reminder',
					message:'<span>Thank you for being with us. The following reminders will be sent to the student</span>\
							<form>\
								<fieldset>\
									<p>Please input you note here</p>\
									<textarea style="resize:none;width:100%" name="sessionComment" id="sessionComment" rows="15" class="text ui-corner-all"></textarea>\
								</fieldset>\
							</form>\
							<p id="fillReminderNotice" style="color:red; display:none">Please fill in the reminder and submit before you leave. If you cannot do it now, please do it later. You can access unfilled reminders from your main screen</p>',
					closable:false,
					autodestroy:true,
					buttons:[
						{
							id:'saveComment',
							label:'Save',
							action:function(dialog){
								var comments = document.getElementById("sessionComment").value;
								if (comments == ""){
									$('#fillReminderNotice').show();
									$('#surveyForm').find(".modal-content").effect("shake", {}, 100);
								} else {
									// this.spin();
									$.ajax({
										url:'/api/session/addComment',
										type:'post',
										data:{
											session_id: storm.sessionId,
											user_id: storm.user.userId,
											comment: comments,
										},
										success:function(response){
											dialog.close();
											if(response.success){
												surveySubmitSuccess.open();
											} else {
												surveySubmitFailed.open();
											}
										}
									});
								}
							}
						}
					]
				});
				
				surveyDialog.open();
				surveyDialog.getModalBody().css('padding-bottom', 0);
			} else if (storm.user.isStudent()){
				var ratingSubmitted = new BootstrapDialog({
					title: 'Đánh giá buổi học',
					message: '<div>Cám ơn bạn đã tham gia buổi học. Bạn có thể đóng cửa sổ này hoặc xem lại bài học.</div>',
					autodestroy: true,
					closable: false,
					buttons:[
						{
							label:'Đóng',
							action:function(dialog){
								dialog.close();
								window.onbeforeunload = null;
							}
						}
					]
				});
				
				var surveyDialog = new BootstrapDialog({
					title: 'Buổi học đã kết thúc',
					closable: false,
					message:function(dialog){
						var content = $('<div></div>');
						var title = $('<div><span>Cảm ơn bạn đã đồng hành cùng Speak up. Vui lòng cho biết mức độ hài lòng của bạn với bài học hôm nay</span>');
						content.append(title);
						var rating = $('<div id="rating" style="width:105px; margin:0 auto"></div>');
						rating.rating({
							scale: 5,
							titles: ["Rất kém", "Kém", "Bình thường", "Tốt", "Rất tốt"],
							eventClick: function(score){
								document.getElementById('ratingInput').value = score;
							}
						});
						content.append(rating);
						var comment = $('<form>\
								<fieldset>\
									<p>Ý kiến khác</p>\
									<textarea style="resize:none;width:100%" name="sessionComment" id="sessionComment" rows="15" class="text ui-corner-all"></textarea>\
									<input type="hidden" id="ratingInput" name="rating"></input>\
								</fieldset>\
								<p id="fillReminderNotice" style="color:red; display:none">Vui lòng chọn mức độ hài lòng của bạn. Nếu bạn không muốn gửi đánh giá, bạn có thể chọn \"Bỏ qua\"</p>\
							</form>');
						content.append(comment);
						
						return content;
					},
					buttons: [
						{
							label: 'Gửi đánh giá',
							action: function(dialog) {
								// this.spin();
								var rating = document.getElementById('ratingInput').value;
								if (rating != ''){
									$.ajax({
										url:'/api/session/addComment',
										type:'post',
										data:{
											session_id: storm.sessionId,
											user_id: storm.user.userId,
											rating: rating,
											comment: document.getElementById('sessionComment').value,
										},
										success:function(){
											dialog.close();
											ratingSubmitted.open();
										}
									});
								} else {
									$('#fillReminderNotice').show();
								}
							},
						},
						{
							label: 'Bỏ qua',
							action: function(dialog){
								dialog.close();
								ratingSubmitted.open();
							}
						}
					]
				});
				
				surveyDialog.open();
				surveyDialog.getModalBody().css('padding-bottom', 0);
			}
		},
		
		
		/**
		 * Update accordion
		 * @method updateAccordian
		 * @param palette_DisplayName
		 */
		updateAccordian: function (palette_DisplayName) {
			$("#accordion").append('<div class="p-header p-close" data-accName="'+ palette_DisplayName +'"></div><div  class="p-cntr" data-paletteName="'+palette_DisplayName+'" id="' + palette_DisplayName + '"></div>');
		},

		/**
		 * Draws Horizontal and Vertical lines that are used as guilde lines for object alignment
		 * @method drawHVLines
		 * @param none
		 */
		drawHVLines: function () {
			//remove first, needs to redraw when window is resized
			canvas.remove(storm.hLine);
			canvas.remove(storm.vLine);

			var width = this.canvasWidth;
			var height = this.canvasHeight;
			storm.hLine = new fabric.Line([0, -10, width, -10], {
				enabled: false,
				stroke: '#ff0000',
				left: width / 2
			});
			storm.vLine = new fabric.Line([-10, 0, -10, height], {
				enabled: false,
				stroke: '#ff0000',
				top: height / 2
			});
			storm.vLine.name = 'vline';
			storm.hLine.name = 'hline';
			canvas.add(storm.hLine);
			canvas.add(storm.vLine);
			storm.hLine.set('fill', '#ff0000');
			storm.vLine.set('fill', '#ff0000');
			storm.hLine.set('strokeWidth', '.5');
			storm.vLine.set('strokeWidth', '.5');
			//disableObject(line);
			//	fabric.util.makeElementUnselectable(line)
		}

        //disableSelected: fun
	};

	return ui;
});
