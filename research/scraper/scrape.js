var fs = require("fs"),
    csv = require("dsv")(","),
    queue = require("queue-async")(10),
    request = require("request");

// Read in CSV from 18F
// https://18f.gsa.gov/2014/12/18/a-complete-list-of-gov-domains/
fs.readFile("2014-12-01-full.csv","utf8",function(err,raw){

  var rows = csv.parse(raw);

  // Defer task for every domain in CSV
  rows.forEach(function(row){
    if (row["Domain Type"] === "Federal Agency") {
      queue.defer(getData,row,false);
    }
  });

  // Wait for results
  queue.awaitAll(function(err,withData){

    // Write JSON with only rows that have a Data URL
    var filtered = withData.filter(function(d){
      return d["Data URL"];
    });

    fs.writeFile("with-data.json",JSON.stringify(filtered));

  });

});

// Try to get data.json for a domain
function getData(row,www,cb) {

  // Construct data.json URL
  // With or without preceding www.
  var domain = row["Domain Name"].toLowerCase(),
      url = "http://" + (www ? "www." : "") + domain + "/data.json";

  // Log progress
  if (!www) {
    console.log(domain);
  }

  // Get the URL
  request.get(url,function(err,res,body){

    var found = false;

    // If the response is OK and valid JSON, we found it
    if (!err && res.statusCode === 200) {
      try {
        found = !!JSON.parse(body);
      } catch(e) {}
    }

    // Write the body for safe-keeping
    // Add Data URL to the row before callback
    if (found) {
      fs.writeFile("json/" + domain + ".json",body);
      console.log("FOUND AT " + url);
      row["Data URL"] = url;
      cb(null,row);
      return;
    }

    // Try again with www.
    if (!www) {
      getData(row,true,cb);
      return;
    }

    // Give up
    cb(null,row);


  });
}