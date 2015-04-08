var http = require('http'); // http package which we talked about
var url = require('url'); // url package which tells node how to parse urls
  // computers send urls in a nasty not very readable format so we need special
  // code to read and understand them
var path = require('path'); // an entire module just for dealing with file paths

var fs = require('fs'); // file system. lets it get stuff from your hard drive.
var mimetypes = require('./mimetypes');

http.createServer(function(req, res) {
  // uri is just a fancy word for the path part of the url
  // like in http://localhost:3000/foo.html it would be foo.html
  var uri = url.parse(req.url).pathname;

  // here we get a full system file path
  // we join the directory where you have your node.js with the path extension
  // requested by the user.
  // we use unescape to process special codes like %20 which represent
  // various letters.
  var filename = path.join(process.cwd(), 'public', unescape(uri));


  fs.lstat(filename, function(err, stats) {
    if(err) {
      // the file wasn't found. send back an error message.
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('404 Not Found\n');
      res.end();
      // ^ yeah. that's a 404 error.
      //  you've created the most hated error on the interweebz. you monster.
    } else {
      if(stats.isFile()) {
        displayFile(filename, res);
      } else if(stats.isDirectory()) {
        displayDirectory(filename, res);
      } else {
        // Symbolic link, other?
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('500 Internal server error\n');
        res.end();
      }
    }
  })

}).listen(3000);


function displayFile(filename, res) {
  // some fancy magic. basically it gets the extension like .html or .png
  var mimeType = mimetypes[path.extname(filename).split(".").reverse()[0]];

  res.writeHead(200, {'Content-Type': mimeType} );

  var fileStream = fs.createReadStream(filename);
  fileStream.pipe(res);
}

function displayDirectory(filename, res) {
  fs.readdir(filename, function(err, files) {
    res.writeHead(200, {'Content-Type': mimetypes['html']});
    res.write('<ul>');
    files.forEach(function writeFileLink(file) {
      res.write('<li><a href=\'' + file + '\'>'+file+'</a></li>');
    });
    res.end('</ul>');
  });
}

console.log('open http://localhost:3000 in your browser. it is now listening');
