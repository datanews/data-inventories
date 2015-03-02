// Explore datasets

var fs = require('fs');
var path = require('path');
var request = require('request');
var _ = require('lodash');
var queue = require('queue-async');
var moment = require('moment');

// Some variables
var data = [];
var dlQueue = queue(4);
var ids, output;

// Output path
var outputPath = path.join(__dirname, '../../src/data/data-inventories.json');

// List of inventories
var urls = require(path.join(__dirname, '../scraper/with-data.json'));

// Determine local files
urls = _.map(urls, function(u, ui) {
  u.id = u['Domain Name'].toLowerCase().replace(/\s/ig, '-');
  u.path = path.join(__dirname, 'original', u.id + '.json')
  return u;
});

// Download (if needed)
console.log('Downloading files if needed ... ');
_.each(urls, function(u, ui) {
  if (!fs.existsSync(u.path)) {

    // Queue up request
    dlQueue.defer(function(done) {
      console.log('Downloading ' + u['Data URL'] + ' ... ');

      request.get(u['Data URL'], function(error, response, body) {
        if (!error && response.statusCode === 200) {
          fs.writeFileSync(u.path, body);
          done();
        }
        else {
          console.error('Error getting JSON file.', error, u);
        }
      });
    });
  }
});

// When done
dlQueue.awaitAll(function(error, results) {
  if (error) {
    console.error('Error with queue.', error);
  }
  console.log('Concatenating files and analyzing ... ');

  // Load files
  urls = _.map(urls, function(u, ui) {
    u.data = require(u.path);
    return u;
  });

  // Concatenate datasets for easier stats
  _.each(urls, function(u, ui) {
    data = data.concat(u.data.dataset);
  });

  // Make sure there are no empty rows or weird data.  There are some
  // data with "-" for values, though a valid description
  data = _.filter(data, function(d, di) {
    return _.isObject(d) && d.accessLevel !== '-';
  });

  // There are some duplicates.  We use the publisher name and identifier to
  // determine if the same dataset.  It looks like the identifier is unique
  // but it doesn't technically need to be unique across agencies.
  // For instance, the identifier "1" is used twice
  ids = {};
  _.each(data, function(d, di) {
    ids[d.identifier + d.publisher.name] = d;
  });
  data = _.values(ids);

  // Create output for project
  console.log('Saving processed file ... \n')
  output = _.map(_.filter(data, function(d, di) {
    return d.accessLevel !== 'public';
  }), function(d, di) {
    // Make smaller for output
    return [
      d.title,
      d.description,
      d.publisher.name,
      d.accessLevel,
      d.license,
      d.accrualPeriodicity
    ];
  });
  fs.writeFileSync(outputPath, JSON.stringify({ o: moment().format('YYYY-MM-DD'), d: output }));

  // Some stats
  // Description of schema: https://project-open-data.cio.gov/schema/

  // Count
  console.log('Files (could be duplicate) count: ', urls.length);
  console.log('============= \n');

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
  /*
  console.log('License count: ', _.map(_.groupBy(data, 'license'), function(d, di) {
    return di + ': '  + d.length;
  }));
  console.log('============= \n');
  */

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

  // Identifier count
  /*
  console.log('Identifier >2 name count: ')
  _.each(_.groupBy(data, function(d, di) {
    return d.identifier;
  }), function(d, di) {
    if (d.length > 1) {
      console.log(di + ': '  + d.length);
    }
  });
  console.log('============= \n');
  */

  // Some data checking
  _.each(data, function(d, di) {
    if (!d.title) {
      console.log(d);
    }
  });
});
