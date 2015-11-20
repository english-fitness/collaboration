define(["storm", "storm.main", "storm.ui", "storm.util"], function (storm, main, ui, util) {
    
	return {
		registerLayout : function (layoutName, layoutDesc) {			
			storm.layout[layoutName] = layoutDesc;
		},
		
		createLayoutsList: function () {
			var thisRef = this;
			var layoutName;
			var html = '<div id="layoutList" style="padding:15px"><b style="font-size:14px">Select a Layout: </b>';
			var layoutContainer = "<select id='layouts' style='width: 160px'>"
			for (layoutName in storm.layout) {
				layoutContainer += '<optgroup label='+layoutName+ '>';
				for (var layoutType in storm.layout[layoutName].layouts) {
					layoutContainer += '<option value='+layoutType+ ' id='+layoutType+'>'+layoutType;
				}
			}
			html += layoutContainer;
			$(document.getElementById('result')).append(html);	
			document.getElementById("layouts").onchange = function(){
				var val = document.getElementById('layouts').value;
				if (val == "uploadLayout") {
					$(document.getElementById("result")).append('<input id = "loadLayout" type="file" style="position: absolute; left: 18px; top: 90px;"/>');
				}				
			}			
		},
		
		setLayoutType: function (type) {
			var opt = document.getElementById(type);
			var group = opt.parentElement.label;				
			var args = storm.layout[group].layouts[type].toolAction();
			if (args) {	
				for (var i = 0; i < args.length; i++) {
					storm.comm.sendDrawMsg({
						palette: "shapes",
						action: "rectangle",
						args: args[i]
					});
				}				
			}
		}
	}
});
