jQuery.fn.extend({
	rating: function(data){
		this.addClass("rating")
		
		if(data.width){
			this.css('width', data.width);
		}
		
		if(data.fontSize){
			this.css('font-size', data.fontSize);
		}
		
		if (!data.scale){
			var scale = 5;
		} else {
			var scale = data.scale;
		}
		
		if (scale > 5){
			this.width(this.width() * (scale / 5));
		}
		
		var showTitle = (data.titles.length >= scale)
		
		for (var i = 0; i < scale; i++){
			var score = i+1;
			var star = $('<a class="star-rating" data-score=' + score + (showTitle ? (' title="' + data.titles[i] + '"') : '')  + '>★</a>');
			this.prepend(star);
			//set padding for the last star to mimic align center
			// if (i == scale - 1){
				// star.css("padding-right", (this.width() - parseInt(star.width()) * scale) / 2);
			// }
		}
		
		if (data.label){
			this.prepend("<p>" + data.label + "</p><br>");
		}
		
		this.find(".star-rating").click(function(){
			$(".star-rating").css("color", "");
			var currentStar = $(this);
			currentStar.css("color", "orange");
			currentStar.nextAll().css("color", "orange");
			data.eventClick($(this).data("score"));
		});
	},
});