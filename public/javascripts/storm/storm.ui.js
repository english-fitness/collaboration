define(["storm"], function (storm) {
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
	            '<b style="color: red">THÔNG BÁO</b><br/>' +
	            '1. Đã có lỗi liên quan đến internet xảy ra <br />' +
	            '2. Hệ thống đang kết nối lại <br /> ' +
	            '3. Vui lòng <span style="color: red">refresh, reload (Nhấn F5)</span> lại trình duyệt nếu đợi quá lâu <br>' +
	            '4. Gọi hỗ trợ nếu làm lại bước 3 nhiều lần nhưng vẫn không hết lỗi <br>' +
	            '<b>Điện thoại hỗ trợ: </b> <span style="color: red;">0969496795</span> <br>' +
	            'Mã lỗi: NO#1</div></div>');
        },
        showMediaDisconnecting: function(){
	        $('body').append('<div class="modal-backdrop fade in disconnecting"><div class="alert-reconnecting">' +
		        '<b style="color: red">THÔNG BÁO</b><br/>' +
		        '1. Đã có lỗi liên quan đến internet xảy ra <br />' +
		        '2. Hệ thống đang kết nối lại <br /> ' +
		        '3. Vui lòng <span style="color: red">refresh, reload (Nhấn F5)</span> lại trình duyệt nếu đợi quá lâu<br>' +
		        '4. Gọi hỗ trợ nếu làm lại bước 3 nhiều lần nhưng vẫn không hết lỗi <br>' +
		        '<b>Điện thoại hỗ trợ: </b> <span style="color: red;">0969496795</span> <br>' +
		        'Mã lỗi: MEDIA#2</div></div>');
        },
        hideDisconnecting: function(){
            $('body .modal-backdrop').remove();
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
