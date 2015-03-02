/* global $:false */

(function(){
  "use strict";

  var template = $('#inventories-template').html();
  var dataSource = './data/data-inventories.json';

  // Create template
  var r = new Ractive({
    el: '.container',
    template: template,
    data: {
    }
  });

  // When data loaded
  function dataLoaded(data) {
    var lastUpdated = data.o;
    var inventories = data.d;

    // Sort
    inventories = _.sortBy(inventories, function(i, ii) {
      return (i[3] === 'not public') ? 'ZZZZZ' : 'AAAAA' +
        i[0];
    });

    // Update with data
    r.set('inventories', inventories);
  }

  // Load data
  $.getJSON(dataSource, dataLoaded);

})();
