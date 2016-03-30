(function ($) {
  module('jQuery#boxerGrid', {
    setup: function () {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function () {
    expect(1);
    strictEqual(this.elems.boxerGrid(), this.elems, 'should be chainable');
  });

  test('is boxerGrid', function () {
    expect(1);
    strictEqual(this.elems.boxerGrid().text(), 'boxerGrid0boxerGrid1boxerGrid2', 'should be boxerGrid');
  });

}(jQuery));
