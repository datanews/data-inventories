// Dataset creator


// Dependencies
var fs = require('fs');
var path = require('path');
var request = require('request');
var _ = require('lodash');
var queue = require('queue-async');
var moment = require('moment');
var csv = require('dsv')(',');
var mkdirp = require('mkdirp');


// Some variables
var dataSearchQueue = queue(5);
var downloadQueue = queue(4);
var requestTimeout = 120000;
var update = (process.argv[2] === 'refresh');


// Inputs and outputs
var dotgovURL = 'https://gsa.github.io/data/dotgov-domains/2014-12-01-full.csv';
var dotgovCSV = path.join(__dirname, 'data/dotgov.csv');
var urlsJSON = path.join(__dirname, 'data/data-inventories.json');
var combineDataJSON = path.join(__dirname, 'data/data-inventory.json');


// Ensure we have directories
mkdirp.sync(path.join(__dirname, 'data'));
mkdirp.sync(path.join(__dirname, 'data/json'));
mkdirp.sync(path.join(__dirname, 'data/csv'));


// Get CSV of dotgov if needed
if (!fs.existsSync(dotgovCSV) || update) {
  console.log('Downloading .gov CSV file ... ');

  request({ url: dotgovURL, timeout: RequestTimeout }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      fs.writeFileSync(dotgovCSV, body);
      lookDomains();
    }
    else {
      console.error('Error getting .gov CSV file.', error, u);
    }
  });
}
else {
  console.log('Found existing .gov CSV file ... ');
  lookDomains();
}


// Look up each domain to see if data.json exists
function lookDomains() {
  if (!fs.existsSync(urlsJSON) || update) {

    fs.readFile(dotgovCSV, 'utf8', function(err, rawCSV) {
      var rows = csv.parse(rawCSV);

      // Only federal sites
      rows = _.filter(rows, function(r, ri) {
        return (r['Domain Type'] === 'Federal Agency');
      });

      // Add some data
      rows = _.map(rows, function(r, ri) {
        r.id = r['Domain Name'].toLowerCase().replace(/\s/ig, '-');
        return r;
      });

      // Could be a while
      console.log('Looking for data.json on ' + rows.length + ' .gov domains (this could take awhile and might output some warnings) ... ');

      // Defer task for every domain in CSV
      // This gives off some errors for some reason:
      // warning: possible EventEmitter memory leak detected. 11 end listeners added.
      _.each(rows, function(r, ri) {
        dataSearchQueue.defer(checkDataURL, r, false);
      });

      // Wait for results
      dataSearchQueue.awaitAll(function(err, data) {
        // Write JSON with only rows that have a Data URL
        var filtered = data.filter(function(d) {
          return d['Data URL'];
        });

        fs.writeFile(urlsJSON, JSON.stringify(filtered), function() {
          getDataInventories();
        });

      });
    });
  }
  else {
    console.log('Found existing data inventories list ... ');
    getDataInventories();
  }
}


// Get actual data inventories data
function getDataInventories() {
  var urls = require(urlsJSON);

  // Download (if needed)
  console.log('Downloading data.json files if needed ... ');
  _.each(urls, function(u, ui) {
    var localPath = path.join(__dirname, 'data/json/', u.id + '.data.json');

    if (!fs.existsSync(localPath) || update) {

      // Queue up request
      downloadQueue.defer(function(done) {
        console.log('Downloading ' + u['Data URL'] + ' ... ');

        request.get({ url: u['Data URL'], timeout: requestTimeout }, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            fs.writeFileSync(localPath, body);
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
  downloadQueue.awaitAll(function(error, results) {
    if (error) {
      console.error('Error with queue.', error);
    }

    combineData();
  });
}


// Combine all data
function combineData() {
  var urls = require(urlsJSON);
  var data = [];
  var ids, output;

  if (fs.existsSync(combineDataJSON) && !update) {
    console.log('Combined file already created.');
    createCSV();
    return;
  }

  console.log('Combining data ... ');

  // Load files together
  urls = _.map(urls, function(u, ui) {
    var localPath = path.join(__dirname, 'data/json/', r.id + '.data.json');
    u.data = require(localPath);
    return u;
  });

  // Concatenate datasets for easier stats
  _.each(urls, function(u, ui) {
    data = data.concat(u.data.dataset);
  });

  // Make sure there are no empty rows or weird data.  There are some
  // data with '-' for values, though a valid description
  data = _.filter(data, function(d, di) {
    return _.isObject(d) && d.accessLevel !== '-';
  });

  // There are some duplicates.  We use the publisher name and identifier to
  // determine if the same dataset.  It looks like the identifier is unique
  // but it doesn't technically need to be unique across agencies.
  // For instance, the identifier '1' is used twice
  ids = {};
  _.each(data, function(d, di) {
    ids[d.identifier + d.publisher.name] = d;
  });
  data = _.values(ids);

  // Create output for project
  fs.writeFileSync(combineDataJSON, JSON.stringify(data));
  console.log('Combine data file saved. ');

  createCSV();
}


// Create CSVs
function createCSV() {
  var urls = require(urlsJSON);

  _.each(urls, function(u, ui) {
    var data = require(u.path);
    var localPath = path.join(__dirname, 'data/csv/', u.id + '.data.csv');
    var output = ['agency', 'publisher', 'title', 'description'];

    // Add datasets
    _.each(data, function(d, di) {
      output.push([
        u['Federal Agency'],
        d.publisher.name,
        d.title,
        d.description
      ]);
    });

    // Output to file
    fs.writeFileSync(path, csv.format(output));
  });
}


// Try to get data.json for a domain, with optional www.
function checkDataURL(row, www, cb) {
  // Construct data.json URL
  // With or without preceding www.
  var domain = row['Domain Name'].toLowerCase(),
      url = 'http://' + (www ? 'www.' : '') + domain + '/data.json';

  // Get the URL
  request.get({ url: url, timeout: requestTimeout }, function(err, res, body) {

    var found = false;

    // If the response is OK and valid JSON, we found it
    if (!err && res.statusCode === 200) {
      try {
        found = !!JSON.parse(body);
      } catch(e) {}
    }

    // Found, save locally
    if (found) {
      console.log('Data found at: ' + url);
      fs.writeFileSync(row.path);
      row['Data URL'] = url;
      cb(null, row);
      return;
    }

    // Try again with www.
    if (!www) {
      checkDataURL(row, true, cb);
      return;
    }

    // Give up
    cb(null, row);
  });
}
