#!/usr/bin/env node
var cheerio = require('cheerio');
var request = require('request');
var fstools = require('fs-tools');
var fs = require('fs');
var url = require('url');
var http = require('http');

var host = process.argv[2];

// TODO: make sure host is set

var http_timeout = 15000;

var base = "http://"+host+"/";
var output_dir = "./"+host;

var visited = {};
var queue = [];
var ready = true;
var running = 0;
var num_processed = 0;

var finishing = 0;

queue.push(base);
loop();


function loop() {
  if(ready) {
    if(queue.length > 0) {
      console.log("Queue length: "+queue.length);
      console.log("Total Processed: "+num_processed);
      ready = false;
      running++;
      num_processed++;

      // console.log("Currently Running: "+running);

      process_link(queue.shift());
      setTimeout(loop, 100);
    } else {
      finishing++;
      if(finishing < 3) {
        setTimeout(loop, http_timeout / 3);
      } else {
        console.log("Nothing left in the queue");
      }
    }
  } else {
    setTimeout(loop, 100);
  }
}



function store_redirect(from, to) {
  var redirects = fs.openSync(output_dir+"/.htaccess", "a");
  fs.writeSync(redirects, from+" "+to+"\n");
  fs.closeSync(redirects);
}


function process_link(current) {

  if(visited[current] == true) {
    // console.log("Already visited!");
    ready = true;
    running--;
    return;
  }

  console.log("===============================");
  console.log("Processing: " + current);

  visited[current] = true;

  request({
    url: current,
    timeout: http_timeout,
    // pool: { maxSockets: 1 },
    followRedirect: function(response) {
      var redirect = url.parse(response.headers.location);
      if(redirect.host == host) {
        return true;
      } else {
        ready = true;
        //running--;
        return false;
      }
    }
  }, function(error,response,body) {

    if(error) {
      console.log(error);
      ready = true;
      running--;
    } else if(response.statusCode == 404) {
      console.log("404 Not Found");
      ready = true;
      running--;
    } else {

      // Find out if we followed any redirects to get here
      var redirect_from = current;
      if(response.request.redirects.length > 0) {
        // Write each redirect to the file
        for(var i=0; i<response.request.redirects.length; i++) {
          var r = response.request.redirects[i];
          store_redirect(redirect_from, r.redirectUri);
          redirect_from = r.redirectUri;
          // Update the "current" URL to set it to the resulting URL
          current = r.redirectUri;
        }
        console.log("Was redirected to: "+current);
      }

      var page_url = url.parse(current);

      // Add a slash if the path is not a file (does not end in a slash and does not have a dot)
      var components = page_url.path.split("/");
      if(!page_url.path.match(/\/$/) && !components[components.length-1].match(/\./)) {
        page_url.path += "/";
      }

      // Add "index.html" if the path ends in a slash
      if(page_url.path.match(/\/$/)) {
        page_url.path += "index.html";
      }

      // The path will now always end in a filename
      // Split the path on / and remove the filename to create the directory
      components = page_url.path.split("/");
      var filename = components.pop();
      var path_components = components.join("/");
      var dirname = output_dir + path_components + "/";
      console.log("Filename: "+filename);
      console.log("Directory: "+dirname);

      // Write the file to disk
      fstools.mkdirSync(dirname);
      fs.writeFileSync(dirname+filename, body, "utf8");

      // Now parse the file looking for other links to follow, and queue them up
      var $ = cheerio.load(body);

      if(response.headers['content-type'] && response.headers['content-type'].match(/css/)) {
        response.body.replace(/url\(([^\)]+)\)/g, function(a,u) {
          // resolve the URL relative to the stylesheet
          u = url.resolve(current, u); 
          enqueue_link(u);
        });
      } else if(response.headers['content-type'] && response.headers['content-type'].match(/javascript/)) {

      } else {
        // assume HTML if it's not JS or CSS
        var links = $("a");
        enqueue_links($, links, "href");
        var css = $("link[rel=stylesheet]");
        enqueue_links($, css, "href");
        var js = $("script");
        enqueue_links($, js, "src");
        var img = $("img");
        enqueue_links($, img, "src");
      }

      ready = true;
      running--;
    }
  });

}

function enqueue_links($, links, selector) {
  for(var i = 0; i < links.length; i++) {
    var a = links[i];
    var next_url = $(a).attr(selector);
    if(next_url) {
      // Node's url.parse doesn't properly parse URLs with no scheme
      if(next_url.match(/^\/\//)) {
        next_url = "http://"+next_url;
      }

      enqueue_link(next_url);
    }
  }
}

function enqueue_link(link) {
  var parsed = url.parse(link);

  // Only queue URLs on the same domain
  if(parsed.host == null || parsed.host == host) {
    // Ignore the query string since we can't do anything with it anyway
    var resolved = url.resolve(base, (parsed.pathname ? parsed.pathname : "")); //+(parsed.search ? parsed.search : ""));
    if(!visited[resolved] && queue.indexOf(resolved) == -1) {
      console.log("queuing: "+resolved);
      queue.push(resolved);
    }
  } else {
    // console.log("skipping: "+next_url);
  }

}
