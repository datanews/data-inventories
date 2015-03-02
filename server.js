// Dependencies
var express = require("express"),
    path = require("path"),
    fs = require("fs");

// Global variables
var app = express(),
    port = 8080; // TODO: make this configurable

// Configure server
app.use(function(req, res, next) {

  // Get parts of URL
  var chunks = req.url.split("/").filter(function(d) {
    return d.length;
  });

  // If we have parts.
  // This redirects to /output/ or /live_files/ if it exists, so you can go to
  // localhost:8080/project_host/ and go to the actual output directory regardless
  // of what generation project it is
  if (chunks.length == 1) {
    // Redirect to output directory if exists
    if (fs.existsSync(path.join(chunks[0], "output"))) {
      return res.redirect("/" + path.join(chunks[0], "output"));
    }

    //Redirect to live_files directory if exists
    if (fs.existsSync(path.join(chunks[0], "live_files"))) {
      return res.redirect("/" + path.join(chunks[0], "live_files"));
    }

  }

  //Just treat it normally
  return next();

});

// Just use the simple static expressness
app.use(express.static(__dirname));

// Use livereload
app.use(require("connect-livereload")());

// Use port
app.listen(port);
console.log("Local server at: http://localhost:" + port + "/");

// Export for gulp-express
module.exports.app = exports.app = app;
