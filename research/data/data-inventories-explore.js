// Explore datasets

var fs = require('fs');
var path = require('path');
var request = require('request');
var _ = require('lodash');

// Full data
var data = [];

// List of inventories
var urls = require(path.join(__dirname, 'data-inventories.json'));

// Local files
var locals = _.map(urls, function(u, ui) {
  var l = {
    path: path.join(__dirname, 'original', ui + '.json')
  };
  return l;
});

// TODO download.  Just did manually with:

/*
curl -L http://epa.gov/data.json > research/data/original/epa.json && \
curl -L http://opm.gov/data.json > research/data/original/opm.json && \
curl -L http://va.gov/data.json > research/data/original/va.json && \
curl -L http://dol.gov/data.json > research/data/original/dol.json
*/

// Load files
locals = _.map(locals, function(l, li) {
  l.data = require(l.path);

  // Concat data
  data = data.concat(l.data.dataset);
  return l;
});


// Some stats
// Description of schema: https://project-open-data.cio.gov/schema/

// Count
console.log('Dataset count: ', data.length);
console.log('============= \n');

// Types of access level
console.log('Access count: ', _.map(_.groupBy(data, 'accessLevel'), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');

// Type
console.log('Type count: ', _.map(_.groupBy(data, '@type'), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');

// Rights is usually not there, but also unique

// Orgs can be departments and in some cases contracters

// Has URL
console.log('Has URL count: ', _.map(_.groupBy(data, function(d, di) {
  return (d.accessURL) ? 'Has URL' : 'No URL';
}), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');

// License
console.log('License count: ', _.map(_.groupBy(data, 'license'), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');

// Period
// https://project-open-data.cio.gov/iso8601_guidance/#accrualperiodicity
console.log('Periodicity count: ', _.map(_.groupBy(data, 'accrualPeriodicity'), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');

// Data quality (boolean)
console.log('Data quailty count: ', _.map(_.groupBy(data, 'dataQuality'), function(d, di) {
  return di + ': '  + d.length;
}));
console.log('============= \n');
