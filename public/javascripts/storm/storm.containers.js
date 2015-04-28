define(["storm", "storm.main", "storm.ui", "storm.util", "storm.layouts"], function (storm, main, ui, util, layouts) {
	return {
		containerName: null,
		currSelection: null,
		canvasWidth: 0,
		canvasHeight: 0,
		registercontainer : function (containerName, containerDesc) {
			storm.containers[containerName] = containerDesc;
		},
		/**
		 * Create a  palette for each type of palette and add it in toolbar
		 * @method createPallette
		 * @param paletteName
		 */
		createContainerList: function () {
			var thisRef = this;
			var html = '<div id="containerlist" style="padding:15px"><b style="font-size: 14px">Select a Container:  </b>';
			var containerHolder = "<select id='containers' >";
			var contName;
			for (contName in storm.containers) {
				var containerObj = storm.containers[contName];
				var container_DisplayName = containerObj.displayName;
				containerHolder += '<option value=' + contName + ' id=' + container_DisplayName + '>' + container_DisplayName;
			}
			html += containerHolder;
			onButtonClick = function () {
				thisRef.onOkClick();
			}
			$(document.getElementById('result')).append(html);
			// create Layouts list
			layouts.createLayoutsList();

			// create a field for canvas width
			var canvasWidth = "<div style='padding:15px'><b style='font-size: 14px'>Canvas Width: </b><input id='canvasWidth' type = 'text' value='1024'><b style='font-size: 14px'>px</b></div>";
			$(document.getElementById('result')).append(canvasWidth);
			$('#canvasWidth').val(storm.containers[$('#containers').val()].width);

			// create a field for canvas height
			var canvasHeight = "<div style='padding:15px'><b style='font-size: 14px'>Canvas Height: </b><input id='canvasHeight' type = 'text' value='768'><b style='font-size: 14px'>px</b></div>";
			$(document.getElementById('result')).append(canvasHeight);
			$('#canvasHeight').val(storm.containers[$('#containers').val()].height);

			// create an OK button on click of which provided container, layout and canvas width and height are rendered
			var btndiv = "<div style='padding:15px'><br><input type='button' value='Ok' onclick=onButtonClick() /></div>";
			$(document.getElementById('result')).append(btndiv);

			// update the canvas width and height fields with those of the selected container.
			$('#containers').change(function() {
				$('#canvasWidth').val(storm.containers[$('#containers').val()].width);
				$('#canvasHeight').val(storm.containers[$('#containers').val()].height);
			});
			popup('popUpDiv', 'closediv', 300, 300);
			$('#closediv').css('display', 'none');
		},
		onOkClick: function () {
			this.containerName = document.getElementById('containers').value;
			this.canvasWidth = document.getElementById('canvasWidth').value;
			this.canvasHeight = document.getElementById('canvasHeight').value;
			this.setContainer(this.containerName, 'new');
			var val = document.getElementById('layouts').value;
			if (val == "uploadLayout") {
				$(document.getElementById("result")).append('<input id = "loadLayout" type="file" />');
			}
			storm.comm.sendContainerInfo({
				action: "setContainer",
				containerName: this.containerName,
				canvasWidth: this.canvasWidth,
				canvasHeight: this.canvasHeight
			});
			$('#closediv').css('display', 'block');
		},
		setContainer: function (containerName, type, width, height) {
			var contObj = storm.containers[containerName];
			ui.deviceHeight = contObj.height;
			ui.deviceWidth = contObj.width;//(contObj.width > 1024)?contObj.width:1024;
			ui.canvasWidth = this.canvasWidth <= 0 ? contObj.width : this.canvasWidth;
			ui.canvasHeight = this.canvasHeight <= 0 ? contObj.height : this.canvasHeight;
			ui.deviceInnerHeight = contObj.innerHeight;
			ui.deviceInnerWidth = contObj.innerWidth;
			storm.xOffset = contObj.xOffset;
			storm.yOffset = contObj.yOffset;
			$('#containerBody').css('position', 'relative');
			var cssObj = {
				'position': 'relative',
				'left' : contObj.xOffset,
				'top' : contObj.yOffset
			};
			$('#canvasId').css(cssObj);
			$('.canvas-container').css('width', this.canvasWidth);
			$('.canvas-container').css('height', this.canvasHeight);
			storm.deviceOffsetX = contObj.xOffset;
			storm.deviceOffsetY = contObj.yOffset;
			if (type === 'new') {
				var val = document.getElementById('layouts').value;
				if (val == "uploadLayout") {
					storm.layoutURL = document.getElementById("loadLayout").files[0];
				}
				layouts.setLayoutType(val);
			}
	        $('#loading').hide();
	        $('#containerBody').css('visibility', 'visible');
		}

	};
});


