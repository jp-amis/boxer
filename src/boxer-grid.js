/*
 * 
 * 
 *
 * Copyright (c) 2016 Joao Paulo Pinheiro Teixeira
 * Licensed under the MIT license.
 */
(function ($) {
  $.fn.boxerGrid = function (options) {
  	var settings = $.extend({
		itemSelector: '.boxer-item',
		columnWidth: 100,
		columnMargin: 10,
		positionOrder: 'dom'
	}, options );

    return this.each(function (i) {
     	var $grid = $(this);     	
     	var totalColumns = 0;
     	var columns = [];

     	function relayout() {
     		console.log('relayout');
     		totalColumns = parseInt($(window).width()/(settings.columnWidth + settings.columnMargin));

     		var remainingWidth = $(window).width() - ((totalColumns * settings.columnWidth) + ((totalColumns-1) * settings.columnMargin));     		
     		$grid.css('left', remainingWidth*.5);

     		var oldRow = [];
     		var currentRow = [];

     		var currentColumn = 0;
     		$grid.find(settings.itemSelector).each(function() {     			
     			// $(this).css('left', 0);
     			// $(this).css('top', 0);
     			$(this).css('left', (currentColumn * settings.columnWidth) + (currentColumn * settings.columnMargin));


     			var thisRow = {
     				top: 0,
     				height: $(this).height()
     			};

     			if(oldRow[currentColumn]) {     				
     				if(settings.positionOrder == 'dom') {     				
     					thisRow.top = oldRow[currentColumn].top + oldRow[currentColumn].height + settings.columnMargin;

     					currentRow[currentColumn] = thisRow;
     				} else if (settings.positionOrder == "space") {
     					
     					var minTop = null;     					
     					var selectedColumn = 0;
     					for(var cColumn = 0; cColumn < oldRow.length; cColumn++) {     						
     						if(currentRow[cColumn]) continue;     						
     						if(minTop == null) {
     							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
     							selectedColumn = cColumn;
     							continue;
     						}
     						if(oldRow[cColumn].top + oldRow[cColumn].height < minTop) {
     							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
     							selectedColumn = cColumn;
     							continue;	
     						}
     					}    

     					console.log(minTop, selectedColumn); 					

     					$(this).css('left', (selectedColumn * settings.columnWidth) + (selectedColumn * settings.columnMargin));
     					thisRow.top = oldRow[selectedColumn].top + oldRow[selectedColumn].height + settings.columnMargin;

     					currentRow[selectedColumn] = thisRow;
     				}

     				$(this).css('top', thisRow.top);
     			} else {
     				currentRow[currentColumn] = thisRow;
     			}

     			
     			
     			currentColumn++;

     			if(currentColumn == totalColumns) {
     				oldRow = currentRow;
     				currentRow = [];
     				currentColumn = 0;
     			}
     		});	
     	}
     	relayout();

     	var tt = null;
     	$(window).on('resize', function() {
     		if(tt != null) {     			
     			clearTimeout(tt);
     		}
     		tt = setTimeout(relayout, 1000);
     	});
     	
    });
  };
}(jQuery));
