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
        VISIBLE_PAGES = NUM_PAGES*1
        PAGE_HEIGHT = 1;
        
        var colors = ['alizarin', 'carrot', 'nephrits', 'wisteria', 'midnight_blue', 'concrete', 'alizarin', 'carrot', 'nephrits', 'wisteria', 'midnight_blue', 'concrete', 'alizarin', 'carrot', 'nephrits', 'wisteria', 'midnight_blue', 'concrete'];
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

    function GridItem(item, $el) {
        this.item = item;
        
        this.$el = null;

        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        
        this.width = 0;
        this.height = 0;

        this.column = 0;
        this.pageNumber = 0;        
    }

    GridItem.prototype.setEl = function($el) {        
        this.item.$el = this.$el = $el;
        if($el)
            this.item.$el.attr('data-h', this.height);
    };

    GridItem.prototype.relayout = function() {
        if(this.$el) {
            this.$el.css({
                top: this.top, // - (this.pageNumber * (GRID.window.height * PAGE_HEIGHT)),
                left: this.left,
            });
        }
    };

    GridItem.prototype.hide = function() {
        this.$el.css('visibility', 'hidden');
    };
    GridItem.prototype.show = function() {
        this.$el.css('visibility', 'visible');
    };

    // GridItem.prototype.updateRect = function() {
    //     this.width = this.$el.width();
    //     this.height = this.$el.height();

    //     this.left = 0;
    // };

    function Page() {        
        this.gridItems = [];
        // this.$el = createEmptyDiv();
        this.pageNumber = 0;
        this.top = 0;
        this.bottom = 0;
        this.isVisible = false;
    }

    Page.prototype.init = function(pageNumber) {
        this.pageNumber = pageNumber;
        
        // this.$el.attr('id', 'grid-page-'+pageNumber);
        // this.$el.attr('data-grid-type', 'page');
        // this.$el.css({
        //     'position': 'absolute',            
        //     'width': '100%',
        //     'height': (GRID.window.height * PAGE_HEIGHT),
        //     'top': 60+(pageNumber * (GRID.window.height * PAGE_HEIGHT)),
        //     // 'box-sizing': 'border-box',
        //     // '-moz-box-sizing': 'border-box',
        //     // '-webkit-box-sizing': 'border-box',
        //     // 'border': '1px solid black',
        //     // 'z-index': '-1',
        //     'opacity': 1,
        //     '-webkit-transition': 'opacity 0.5s ease-out',
        //     'transition': 'opacity 0.5s ease-out'
        // });
        

        // shuffle(colors);
        // var color = colors[Math.floor(Math.random() * colors.length)];
        // this.$el.addClass(color);

        // $('body').append(this.$el);

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
        GRID.$el.append($els);
    };

    Page.prototype.checkVisibility = function(force) {
        if(
            (this.top >= GRID.visibleTop && this.top <= GRID.visibleBottom) ||
            (this.bottom >= GRID.visibleTop && this.bottom <= GRID.visibleBottom) ||
            (this.top <= GRID.visibleTop && this.bottom >= GRID.visibleBottom)
        ) {
            if(!this.isVisible || force){
                // GRID.$el.append(this.$el);
                this.isVisible = true;
                // for(var i = 0; i < this.gridItems.length; i++) {
                //     this.gridItems[i].setEl(GRID.pools[this.gridItems[i].item.type].getObject());
                //     this.gridItems[i].relayout();
                //     this.gridItems[i].item.relayout();
                //     GRID.$el.append(this.gridItems[i].$el);
                // }
                return {action:'append'};                
            }            
            // this.$el.css('visibility', 'visible');            
        } else {
            if(this.isVisible || force) {
                // this.$el = this.$el.detach();
                this.isVisible = false;
                // for(var i = 0; i < this.gridItems.length; i++) {     
                //     if(this.gridItems[i].item.$el) {
                //         GRID.pools[this.gridItems[i].item.type].release(this.gridItems[i].item.$el);
                //     } else {
                //         break;
                //     }
                // }
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
        this.processedGridItems = 0;
        this.pools = {};

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

        this.isUpdatingVisibility = false;
        this.shouldUpdateVisibility = false;
    }

    Grid.prototype.init = function() {
        var self = this;
        this.totalColumns = parseInt(this.window.width/(this.settings.columnWidth + this.settings.columnMargin));

        // Loop over itens to put it in pages
        // this.$el.find(this.settings.itemSelector).each(function() {     
        for(var i = 0; i < this.settings.items.length; i++) {                            
            this.addGridItem(this.settings.items[i])            
            // gridItem.width = gridItem.$el.width();
            // gridItem.height = gridItem.$el.height();

            // self.processGridItem(gridItem);

            // self.currentColumn++;

            // if(self.currentColumn == self.totalColumns) {
            //     self.previousRow = self.currentRow;
            //     self.currentRow = [];
            //     self.currentColumn = 0;
            // }
        }
        // });

        // var $elPages = [];
        for(var i = 0; i < this.pages.length; i++) {            
            this.pages[i].massAppend();

            // $elPages.push(this.pages[i].$el);
        }

        // this.$el.append($elPages);
        

        this.updateVisibility();
    };

    Grid.prototype.addGridItem = function(item) {
        var gridItem = new GridItem(item);
        this.gridItems.push(gridItem);
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
        // if(addToArray !== false)
        //     this.gridItems.push(gridItem);        
        gridItem.pageNumber = page.pageNumber;
        gridItem.relayout();
    };

    Grid.prototype.updateVisibility = function(force) {
        if(this.isUpdatingVisibility) {
            this.shouldUpdateVisibility = true;
            return;               
        }
        if(typeof force === undefined) force = false;

        // if(force){
        //     for(var i = 0; i < this.processedGridItems; i++) {
        //         var gridItem = this.gridItems[i];

        //         this.pools[gridItem.item.type].release(gridItem.$el);

        //         gridItem.setEl(null);
        //     }
        // }

        this.isUpdatingVisibility = true;

        this.scrollTop = $(window).scrollTop();
        this.visibleTop = this.scrollTop - (VISIBLE_PAGES * (GRID.window.height * PAGE_HEIGHT));
        this.visibleBottom = this.scrollTop + (GRID.window.height * PAGE_HEIGHT) + (VISIBLE_PAGES * (GRID.window.height * PAGE_HEIGHT));                

        var mustProcess = false;
        if(this.processedGridItems < this.gridItems.length) {
            mustProcess = true;
        }        
        
        while(mustProcess) {            
            var gridItem = this.gridItems[this.processedGridItems];


            if(!this.pools[gridItem.item.type]) this.pools[gridItem.item.type] = new Pool(gridItem.item.type);

            gridItem.setEl(this.pools[gridItem.item.type].getObject());
            gridItem.hide();

            gridItem.item.relayout();
            this.$el.append(gridItem.$el);
            
            gridItem.width = gridItem.$el.width();
            gridItem.height = gridItem.$el.height();

            this.processGridItem(gridItem);

            this.currentColumn++;

            if(this.currentColumn == this.totalColumns) {
                this.previousRow = this.currentRow;
                this.currentRow = [];
                this.currentColumn = 0;
            }

            gridItem.show();

            this.pools[gridItem.item.type].release(gridItem.$el);


            this.processedGridItems++;
            if(this.processedGridItems == this.gridItems.length) {
                mustProcess = false;
            }

            gridItem.setEl(null);
        }

        // this.currentColumn = 0;
        // this.currentRow = [];
        // this.previousRow = [];

        this.$el.css('height', this.pages.length * (GRID.window.height * PAGE_HEIGHT));

        var append = [];
        var detach = [];
        for(var i = this.pages.length - 1; i >= 0; i--) {
            console.log(i, this.pages[i].isVisible);
            var obj = this.pages[i].checkVisibility(force);    
            if(obj) {
                if(obj.action == "append") append.push(this.pages[i]);
                if(obj.action == "detach") detach.push(this.pages[i]);
            }        
        }        
        
        for(var i = 0; i < detach.length; i++) {                  
            for(var j = 0; j < detach[i].gridItems.length; j++) {                
                if(detach[i].gridItems[j].item.$el) {                    
                    GRID.pools[detach[i].gridItems[j].item.type].release(detach[i].gridItems[j].item.$el);
                    detach[i].gridItems[j].setEl(null);
                } else {
                    break;
                }                
            }
        }        

        for(var i = 0; i < append.length; i++) {            
            for(var j = 0; j < append[i].gridItems.length; j++) {
                append[i].gridItems[j].setEl(GRID.pools[append[i].gridItems[j].item.type].getObject());
                append[i].gridItems[j].relayout();
                append[i].gridItems[j].item.relayout();
                if(GRID.$el.find('[data-pf="'+append[i].gridItems[j].$el.attr('data-pf')+'"]').length == 0) {
                    GRID.$el.append(append[i].gridItems[j].$el);
                }                
            }
        }
        // $(detach).css('opacity', 0);
        // $(detach).detach();
        // if(append != '') {
        //     document.getElementById(this.$el.attr('id')).innerHTML += append;        
        //     // this.$el.append(append);        
        //     this.$el.find('div').delay(5).css('opacity', 1);
        // }

        this.$el.css('left', (this.window.width*.5) - ((this.totalColumns*this.settings.columnWidth)*.5) - (((this.totalColumns-1)*this.settings.columnMargin)*.5));

        this.isUpdatingVisibility = false;
        if(this.shouldUpdateVisibility) {
            this.shouldUpdateVisibility = false;
            this.updateVisibility();
        }        
    };

    Grid.prototype.relayout = function() {
        this.window = {
            width: $(window).width(),
            height: $(window).height()
        };
        var oldTotalColumns = this.totalColumns;
        this.totalColumns = parseInt(this.window.width/(this.settings.columnWidth + this.settings.columnMargin));

        console.log('Old Total Columns:', oldTotalColumns);
        console.log('New Total Columns:', this.totalColumns);

        if(oldTotalColumns != this.totalColumns) {
            this.processedGridItems = 0;

            this.currentColumn = 0;
            this.currentRow = [];
            this.previousRow = [];
            
            delete this.pages;
            this.pages = [];

            this.$el.empty();

            this.updateVisibility();
        }        
    };

    Grid.prototype.update = function($el) {
        var mTop = $el.offset().top - this.$el.offset().top;
        var mLeft = $el.offset().left - this.$el.offset().left;  
        var diffHeight = $el.height();      
        for(var i = 0; i < this.gridItems.length; i++) {
            // console.log('----', i, '----');
            // console.log('top:', mTop, '=',this.gridItems[i].top);
            // console.log('left:', mLeft, '=',this.gridItems[i].left);            
            // console.log('top > other_top', mTop > this.gridItems[i].top);
            // console.log('top = other_top', mTop == this.gridItems[i].top);
            // console.log('left = other_left', mLeft == this.gridItems[i].left);
            if(mTop < this.gridItems[i].top && mLeft == this.gridItems[i].left) {
                // console.log('same column');
                this.gridItems[i].top += diffHeight;                
                this.gridItems[i].relayout();
            } else if (mTop == this.gridItems[i].top && mLeft == this.gridItems[i].left) {
                // console.log('the item');
                diffHeight -= this.gridItems[i].height;
                // diffHeight *= -1;
                this.gridItems[i].height = $el.height();
            }
            // console.log('----', '#', '----');
            // console.log('');
        }
    };

    var Pool = function(type) {
        this.type = type;
        this.inUse = [];
        this.avaiable = [];
        this.id = -1;
    };

    Pool.prototype.getObject = function() {
        var $object = null;
        if(this.avaiable.length == 0) {
            this.id++;        
            $object = $(GRID.settings.templates[this.type]);
            this.inUse.push($object);
            $object.attr('data-pf', this.id);            
        } else {
            $object = this.avaiable.shift();
            this.inUse.push($object);            
            // $object.attr('data-pf', this.inUse.length-1);            
        }
        // console.log('GET', 'In Use:', this.inUse.length, '::', 'Avaiable:',this.avaiable.length);
        return $object;
    };

    Pool.prototype.release = function($object) {
        // $object = $object.detach();
        this.avaiable.push($object);
        for(var i = 0; i < this.inUse.length; i++) {
            if($object.attr('data-pf') == this.inUse[i].attr('data-pf')) {
                this.inUse.splice(i, 1);
                break;
            }            
        }        
        // console.log('RELEASE', 'In Use:', this.inUse.length, '::', 'Avaiable:',this.avaiable.length);
    };    


    $.fn.boxerGrid = function (options) {
	  	var settings = $.extend({
			itemSelector: '.boxer-item',
			columnWidth: 100,
			columnMargin: 10,
			positionOrder: 'dom',
			debug: false,
            items: [],
            templates: {}
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

	    this.each(function (i) {
            GRID = new Grid($(this), settings);            
            $( window ).load(function() {
                var start = new Date().getTime();
                GRID.init();
                var end = new Date().getTime();
                var time = end - start;      
                console.log('INIT', GRID.gridItems.length + ' items initialized in:', time);                                     
            });               	  
	   
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
        return GRID;	
	  };
}(jQuery));
