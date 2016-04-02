/*
 * 
 * 
 *
 * Copyright (c) 2016 Joao Paulo Pinheiro Teixeira
 * Licensed under the MIT license.
 */
(function ($) {
    var GRID;
    var NUM_PAGES = 1,
        VISIBLE_PAGES = NUM_PAGES*.5
        PAGE_HEIGHT = 1;
        
        var colors = ['alizarin', 'carrot', 'nephrits', 'wisteria', 'midnight_blue', 'concrete'];
        function shuffle(a) {
          var j, x, i;
          for (i = a.length; i; i -= 1) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
          }
        }

    function createEmptyDiv() {
        return $('<div>').css({
            margin: 0,
            padding: 0,
            border: 'none'
        });
    }

    function GridItem($el) {
        this.$el = $el;

        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        
        this.width = 0;
        this.height = 0;

        this.column = 0;
        this.pageNumber = 0;
    }

    GridItem.prototype.relayout = function() {
        this.$el.css({
            top: this.top - (this.pageNumber * (GRID.window.height * PAGE_HEIGHT)),
            left: this.left,
        })
    };

    // GridItem.prototype.updateRect = function() {
    //     this.width = this.$el.width();
    //     this.height = this.$el.height();

    //     this.left = 0;
    // };

    function Page() {        
        this.gridItems = [];
        this.$el = createEmptyDiv();
        this.pageNumber = 0;
        this.top = 0;
        this.bottom = 0;
        this.isVisible = true;
    }

    Page.prototype.init = function(pageNumber) {
        this.pageNumber = pageNumber;
        // this.$el.top = pageNumber * (GRID.window.height * PAGE_HEIGHT);
        this.$el.attr('id', 'grid-page-'+pageNumber);
        this.$el.attr('data-grid-type', 'page');
        this.$el.css({
            'position': 'absolute',            
            'width': '100%',
            'height': (GRID.window.height * PAGE_HEIGHT),
            'top': pageNumber * (GRID.window.height * PAGE_HEIGHT),
            // 'box-sizing': 'border-box',
            // '-moz-box-sizing': 'border-box',
            // '-webkit-box-sizing': 'border-box',
            // 'border': '1px solid black',
            // 'z-index': '-1',
            'opacity': 1,
            '-webkit-transition': 'opacity 0.5s ease-out',
            'transition': 'opacity 0.5s ease-out'
        });
        

        // shuffle(colors);
        // var color = colors[Math.floor(Math.random() * colors.length)];
        // this.$el.addClass(color);

        GRID.$el.append(this.$el);

        this.top = pageNumber * (GRID.window.height * PAGE_HEIGHT);
        this.bottom = this.top + (GRID.window.height * PAGE_HEIGHT);
    };

    Page.prototype.append = function(gridItem) {        
        this.gridItems.push(gridItem);
        // this.$el.append(gridItem.$el);
    };
    Page.prototype.massAppend = function() {
        var $els = [];
        for(var i = 0; i < this.gridItems.length; i++) {
            $els.push(this.gridItems[i].$el);
        }
        this.$el.append($els);
    };

    Page.prototype.checkVisibility = function() {
        if(
            (this.top >= GRID.visibleTop && this.top <= GRID.visibleBottom) ||
            (this.bottom >= GRID.visibleTop && this.bottom <= GRID.visibleBottom) ||
            (this.top <= GRID.visibleTop && this.bottom >= GRID.visibleBottom)
        ) {
            if(!this.isVisible){
                // GRID.$el.append(this.$el);
                this.isVisible = true;
                return {action:'append', page:this.$el};                
            }            
            // this.$el.css('visibility', 'visible');            
        } else {
            if(this.isVisible) {
                // this.$el = this.$el.detach();
                this.isVisible = false;
                return {action:'detach'};
            }            
            // this.$el.css('visibility', 'hidden');
        }

        return null;
    };


    function Grid($el, settings) {
        this.$el = $el;
        this.settings = settings;

        this.pages = [];
        this.gridItems = [];

        this.totalColumns = -1;

        this.window = {
            width: $(window).width(),
            height: $(window).height()
        };

        this.currentColumn = 0;
        this.currentRow = [];
        this.previousRow = [];

        this.scrollTop = 0;

        this.visibleTop = 0;
        this.visibleBottom = 0;
    }

    Grid.prototype.init = function() {
        var self = this;
        this.totalColumns = parseInt(this.window.width/(this.settings.columnWidth + this.settings.columnMargin));

        // Loop over itens to put it in pages
        this.$el.find(this.settings.itemSelector).each(function() {                                 
            var gridItem = new GridItem($(this));
            
            gridItem.width = gridItem.$el.width();
            gridItem.height = gridItem.$el.height();                      

            self.processGridItem(gridItem);

            self.currentColumn++;

            if(self.currentColumn == self.totalColumns) {
                self.previousRow = self.currentRow;
                self.currentRow = [];
                self.currentColumn = 0;
            }
        });

        // var $elPages = [];
        for(var i = 0; i < this.pages.length; i++) {            
            this.pages[i].massAppend();

            // $elPages.push(this.pages[i].$el);
        }

        // this.$el.append($elPages);

        this.currentColumn = 0;
        this.currentRow = [];
        this.previousRow = [];

        this.$el.css('height', this.pages.length * (GRID.window.height * PAGE_HEIGHT));
    };

    Grid.prototype.processGridItem = function(gridItem, addToArray) {
        gridItem.top = 0;
        gridItem.left = (this.currentColumn * this.settings.columnWidth) + (this.currentColumn * this.settings.columnMargin);        

        if(this.previousRow[this.currentColumn]) {                     
            if(this.settings.positionOrder == 'dom') {                   
                gridItem.top = this.previousRow[this.currentColumn].top + this.previousRow[this.currentColumn].height + this.settings.columnMargin;                         
                this.currentRow[this.currentColumn] = gridItem;
            } else if (this.settings.positionOrder == "space") {            
                var minTop = null;                      
                var selectedColumn = 0;
                for(var cColumn = 0; cColumn < this.previousRow.length; cColumn++) {                          
                    if(this.currentRow[cColumn]) continue;                           
                    if(minTop == null) {
                        minTop = this.previousRow[cColumn].top + this.previousRow[cColumn].height;
                        selectedColumn = cColumn;
                        continue;
                    }
                    if(this.previousRow[cColumn].top + this.previousRow[cColumn].height < minTop) {
                        minTop = this.previousRow[cColumn].top + this.previousRow[cColumn].height;
                        selectedColumn = cColumn;
                        continue;   
                    }
                }    
                    
                gridItem.left = (selectedColumn * this.settings.columnWidth) + (selectedColumn * this.settings.columnMargin);                        
                gridItem.top = this.previousRow[selectedColumn].top + this.previousRow[selectedColumn].height + this.settings.columnMargin;

                this.currentRow[selectedColumn] = gridItem;
            }            
        } else {
            this.currentRow[this.currentColumn] = gridItem;
        }            
                
        var page;

        for(var i = this.pages.length - 1; i >= 0; i--) {
            var pageY1 = i * (GRID.window.height * PAGE_HEIGHT);
            var pageY2 = pageY1 + (GRID.window.height * PAGE_HEIGHT);
            if(gridItem.top >= pageY1 && gridItem.top <= pageY2) {
                page = this.pages[i];
                break;
            }
        }

        if(!page) {
            page = new Page();
            page.init(this.pages.length);
            this.pages.push(page);
        }        

        page.append(gridItem);
        if(addToArray !== false)
            this.gridItems.push(gridItem);
        gridItem.pageNumber = page.pageNumber;
        gridItem.relayout();
    };

    Grid.prototype.updateVisibility = function(e) {                
        this.scrollTop = $(window).scrollTop();
        this.visibleTop = this.scrollTop - (VISIBLE_PAGES * (GRID.window.height * PAGE_HEIGHT));
        this.visibleBottom = this.scrollTop + (GRID.window.height * PAGE_HEIGHT) + (VISIBLE_PAGES * (GRID.window.height * PAGE_HEIGHT));        

        var append = '';
        var detach = '';
        for(var i = this.pages.length - 1; i >= 0; i--) {
            var obj = this.pages[i].checkVisibility();            
            if(obj) {
                if(obj.action == "append") {
                    // append.push(obj.page);
                    append += $("<div />").append(obj.page.clone()).html();
                } else if(obj.action == "detach") detach += (detach != '' ? ',' : '')+'#grid-page-'+i;
            }
        }        
        
        $(detach).css('opacity', 0);
        $(detach).detach();
        if(append != '') {
            document.getElementById(this.$el.attr('id')).innerHTML += append;        
            // this.$el.append(append);        
            this.$el.find('div').delay(5).css('opacity', 1);
        }
    };

    Grid.prototype.relayout = function() {
        this.window = {
            width: $(window).width(),
            height: $(window).height()
        };

        this.totalColumns = parseInt(this.window.width/(this.settings.columnWidth + this.settings.columnMargin));        

        for(var i = 0; i < this.pages.length; i++) {        
            this.pages[i].gridItems = [];
        }
        //     console.log('-',i);
        //     for(var j = 0; j < this.pages[i].gridItems.length; j++) {
        //         console.log('---',j);
        //         this.processGridItem(this.pages[i].gridItems[j]);
        //         self.currentColumn++;

        //         if(self.currentColumn == self.totalColumns) {
        //             self.previousRow = self.currentRow;
        //             self.currentRow = [];
        //             self.currentColumn = 0;
        //         }
        //     }                        
        // }

        for(var i = 0; i < this.gridItems.length; i++) {            
            this.processGridItem(this.gridItems[i], false);
            this.currentColumn++;

            if(this.currentColumn == this.totalColumns) {
                this.previousRow = this.currentRow;
                this.currentRow = [];
                this.currentColumn = 0;
            }
        }

        this.currentColumn = 0;
        this.currentRow = [];
        this.previousRow = [];
    };


    $.fn.boxerGrid = function (options) {
	  	var settings = $.extend({
			itemSelector: '.boxer-item',
			columnWidth: 100,
			columnMargin: 10,
			positionOrder: 'dom',
			debug: false
		}, options );

		// if(settings.debug) {
		// 	$('body').prepend('<div id="boxer-debug-box-window"></div>');
		// 	$boxerDebugBoxWindow = $('#boxer-debug-box-window');
		// 	$boxerDebugBoxWindow
		// 		.css('width', $(window).width())
		// 		.css('height', '200px')
		// 		.css('position', 'fixed')
		// 		.css('top', '0')
		// 		.css('left', '0')
		// 		.css('background-color', 'rgba(192, 57, 43,0.3)')
		// 		.css('box-sizing', 'border-box')
	 //        	.css('-moz-box-sizing', 'border-box')
	 //        	.css('-webkit-box-sizing', 'border-box')
	 //        	.css('border', '1px solid rgba(192, 57, 43,1)')
	 //        	.css('z-index', '999999999'); 

		// }

	    return this.each(function (i) {
            GRID = new Grid($(this), settings);            
            $( window ).load(function() {
                var start = new Date().getTime();
                GRID.init();
                var end = new Date().getTime();
                var time = end - start;      
                console.log('INIT', 'Execution time:', time);                     
            });            
	   //   	var $grid = $(this);     	
	   //   	var totalColumns = 0;
	   //   	var columns = [];
	   //   	var visibleAreaHeight = 0;
	   //   	var windowHeight = 0;
	   //   	var visibleAreaHeightHalf = 0;
	   //   	var windowHeightHalf = 0;

	   //   	$grid.find(settings.itemSelector).css('visibility', 'hidden');

	   //   	function relayout() {
	   //   		windowHeight = $(window).height();
	   //   		windowHeightHalf = windowHeight*.5;

	   //   		visibleAreaHeight = ($(window).height()*.5);
	   //   		visibleAreaHeightHalf = visibleAreaHeight*.5;

	   //   		var scrollTop = $(window).scrollTop();
	   //   		var visibleAreaRec = {
	 		// 		// x1: 0,
	 		// 		// x2: $(window).width(),
	 		// 		y1: scrollTop + windowHeightHalf - visibleAreaHeightHalf,
	 		// 		y2: scrollTop + windowHeightHalf + visibleAreaHeightHalf,
	 		// 	}; 	

	   //   		if(settings.debug) {
	   //   			$boxerDebugBoxWindow
	   //   				.css('height', visibleAreaHeight)
	   //   				.css('width', $(window).width())
	   //   				.css('top', ($(window).height()*.5) - ($boxerDebugBoxWindow.height()*.5));     			
	   //   		}
	     		
	   //   		totalColumns = parseInt($(window).width()/(settings.columnWidth + settings.columnMargin));

	   //   		var remainingWidth = $(window).width() - ((totalColumns * settings.columnWidth) + ((totalColumns-1) * settings.columnMargin));     		
	   //   		$grid
	   //   			.css('left', remainingWidth*.5)
	   //   			.css('width', $(window).width() - remainingWidth);

	   //   		var oldRow = [];
	   //   		var currentRow = [];

	   //   		var currentColumn = 0;
	   //   		$grid.find(settings.itemSelector).each(function() {     			     			
	   //   			var newTL = {
	   //   				top: 0,
	   //   				left: (currentColumn * settings.columnWidth) + (currentColumn * settings.columnMargin)
	   //   			};     			


	   //   			var thisRow = {
	   //   				top: 0,
	   //   				height: $(this).height()
	   //   			};

	   //   			if(oldRow[currentColumn]) {     				
	   //   				if(settings.positionOrder == 'dom') {     				
	   //   					thisRow.top = oldRow[currentColumn].top + oldRow[currentColumn].height + settings.columnMargin;     					
	   //   					currentRow[currentColumn] = thisRow;
	   //   				} else if (settings.positionOrder == "space") {
	     					
	   //   					var minTop = null;     					
	   //   					var selectedColumn = 0;
	   //   					for(var cColumn = 0; cColumn < oldRow.length; cColumn++) {     						
	   //   						if(currentRow[cColumn]) continue;     						
	   //   						if(minTop == null) {
	   //   							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
	   //   							selectedColumn = cColumn;
	   //   							continue;
	   //   						}
	   //   						if(oldRow[cColumn].top + oldRow[cColumn].height < minTop) {
	   //   							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
	   //   							selectedColumn = cColumn;
	   //   							continue;	
	   //   						}
	   //   					}    
	     							
	   //   					newTL.left = (selectedColumn * settings.columnWidth) + (selectedColumn * settings.columnMargin);     					
	   //   					thisRow.top = oldRow[selectedColumn].top + oldRow[selectedColumn].height + settings.columnMargin;

	   //   					currentRow[selectedColumn] = thisRow;
	   //   				}

	   //   				newTL.top = thisRow.top;
	   //   				$(this).css('top', thisRow.top);
	   //   			} else {
	   //   				currentRow[currentColumn] = thisRow;
	   //   			}

	   //   			$(this).css('left', newTL.left);     			
	     			
	   //   			toogleVisibility($(this), newTL, visibleAreaRec);

	   //   			currentColumn++;

	   //   			if(currentColumn == totalColumns) {
	   //   				oldRow = currentRow;
	   //   				currentRow = [];
	   //   				currentColumn = 0;
	   //   			}
	   //   		});
	   //   	}

	   //   	function relayoutVisibility() {
	   //   		var start = new Date().getTime();

	   //   		var scrollTop = $(window).scrollTop();

	   //   		var oldRow = [];
	   //   		var currentRow = [];

	   //   		var currentColumn = 0;

	   //   		var visibleAreaRec = {
	 		// 		// x1: 0,
	 		// 		// x2: $(window).width(),
	 		// 		y1: scrollTop + windowHeightHalf - visibleAreaHeightHalf - 150,
	 		// 		y2: scrollTop + windowHeightHalf + visibleAreaHeightHalf + 150,
	 		// 	}; 			

	   //   		$grid.find(settings.itemSelector).each(function() {     			     			
	   //   			var elHeight = $(this).height();
	   //   			var newTL = {
	   //   				top: 0,
	   //   				left: (currentColumn * settings.columnWidth) + (currentColumn * settings.columnMargin)
	   //   			};     			


	   //   			var thisRow = {
	   //   				top: 0,
	   //   				height: elHeight
	   //   			};

	   //   			if(oldRow[currentColumn]) {     				
	   //   				if(settings.positionOrder == 'dom') {     				
	   //   					thisRow.top = oldRow[currentColumn].top + oldRow[currentColumn].height + settings.columnMargin;     					
	   //   					currentRow[currentColumn] = thisRow;
	   //   				} else if (settings.positionOrder == "space") {
	     					
	   //   					var minTop = null;     					
	   //   					var selectedColumn = 0;
	   //   					for(var cColumn = 0; cColumn < oldRow.length; cColumn++) {     						
	   //   						if(currentRow[cColumn]) continue;     						
	   //   						if(minTop == null) {
	   //   							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
	   //   							selectedColumn = cColumn;
	   //   							continue;
	   //   						}
	   //   						if(oldRow[cColumn].top + oldRow[cColumn].height < minTop) {
	   //   							minTop = oldRow[cColumn].top + oldRow[cColumn].height;
	   //   							selectedColumn = cColumn;
	   //   							continue;	
	   //   						}
	   //   					}    
	     							
	   //   					newTL.left = (selectedColumn * settings.columnWidth) + (selectedColumn * settings.columnMargin);     					
	   //   					thisRow.top = oldRow[selectedColumn].top + oldRow[selectedColumn].height + settings.columnMargin;

	   //   					currentRow[selectedColumn] = thisRow;
	   //   				}

	   //   				newTL.top = thisRow.top;     				
	   //   			} else {
	   //   				currentRow[currentColumn] = thisRow;
	   //   			}     			
	     			
	   //   			toogleVisibility($(this), newTL, visibleAreaRec);

	   //   			currentColumn++;

	   //   			if(currentColumn == totalColumns) {
	   //   				oldRow = currentRow;
	   //   				currentRow = [];
	   //   				currentColumn = 0;
	   //   			}
	   //   		});

	   //   		var end = new Date().getTime();
				// var time = end - start;		
				// console.log('Execution time:', time);	
	   //   	}

	   //   	function toogleVisibility($el, topLeft, visibleAreaRec) {     		

	 		// 	var pointsToTest = {
	 		// 		y1: topLeft.top,
	 		// 		y2: topLeft.top + $el.height()
	 		// 	};
	 			
	 		// 	if(
	 		// 		(pointsToTest.y1 >= visibleAreaRec.y1 && pointsToTest.y1 <= visibleAreaRec.y2) ||
	 		// 		(pointsToTest.y2 >= visibleAreaRec.y1 && pointsToTest.y2 <= visibleAreaRec.y2) ||
	 		// 		(pointsToTest.y1 <= visibleAreaRec.y1 && pointsToTest.y2 >= visibleAreaRec.y2)
	 		// 		) { 				
	 		// 		$el.css('visibility', 'visible'); 				
	 		// 	} else { 				
	 		// 		$el.css('visibility', 'hidden'); 				
	 		// 	}
	   //   	}

	   //   	relayout();
	   
	     	$(window).on('scroll', function() {
	     		var start = new Date().getTime();
                GRID.updateVisibility();
                var end = new Date().getTime();
                var time = end - start;      
                console.log('SCROLL', 'Execution time:', time);    
	     	});

            var tt = null; 
	     	$(window).on('resize', function() {
	     		if(tt != null) {     			
	     			clearTimeout(tt);
	     		}
	     		tt = setTimeout(function() {
                    var start = new Date().getTime();
                    GRID.relayout();
                    var end = new Date().getTime();
                    var time = end - start;      
                    console.log('RELAYOUT', 'Execution time:', time);    
                }, 250);
	     	});    
	    });	
	  };
}(jQuery));
