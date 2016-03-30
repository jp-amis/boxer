/*
 * 
 * 
 *
 * Copyright (c) 2016 Joao Paulo Pinheiro Teixeira
 * Licensed under the MIT license.
 */
(function ($) {
  $.fn.boxerGrid = function () {
    return this.each(function (i) {
      // Do something to each selected element.
      $(this).html('boxerGrid' + i);
    });
  };
}(jQuery));
