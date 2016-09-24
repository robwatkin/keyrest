var http = require('http');

module.exports = function(opts) {
  opts = opts || {};
  opts.host = opts.host || '0.0.0.0';
  opts.port = opts.controlPort || 4000;
  opts.logReq = opts.logReq || true;
  opts.logControl = opts.logControl || true;

  var control = opts.control || {};

  var controlServer = http.createServer(function(req, res) {

    if(opts.logReq) {
      console.log('* keyrest * ' + req.method + ' ' + req.url);
    }

    var responseText = '',
        responseHeader = function() {
          return {
            "Content-Type": "application/json",
          };
        };

    var respondOkWithControl = function() {
      responseText = JSON.stringify(control);
      responseHeader["Content-Length"] = responseText.length;
      res.writeHead(200, responseHeader);
      res.end(responseText);
    };

    responseHeader["Content-Length"] = responseText.length;

    if (req.url === '/') {
      if(req.method === 'GET') {
        respondOkWithControl();
      } else if (req.method === 'DELETE') {

        Object.keys(control).forEach(function(key){
          delete control[key];
        });
        respondOkWithControl();
      }
    } else if(req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {

      var key,
          value,
          matches = req.url.match(/^\/([a-zA-Z-]+)\/([a-zA-Z0-9-_]*)$/);

      if (matches === null || matches.length < 3){
        throw '* keyrest * target not found in url ' + req.url;
      }

      key = matches[1];
      value = matches[2];

      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (/^[0-9]+$/.test(value)) {
        value = parseInt(value);
      }

      if(req.method === 'PUT') {
        control[key] = value;

      } else if(req.method === 'POST') {
        if(control[key]) {
          if(!Array.isArray(control[key])) {
            control[key] = [control[key]];
          }
          control[key].push(value);
        } else {
          control[key] = value;
        }
      } else {
        delete control[key];
      }

      if(opts.logControl) {
        console.log('* keyrest * control: ', control);
      }

      respondOkWithControl();

    } else  {
      console.log('* keyrest * ERROR bad method: ' + req.method);
      responseHeader["Content-Length"] = responseText.length;
      res.writeHead(404, responseHeader);
      res.end(responseText);
    }

  });

  controlServer.listen(opts.port, opts.host);
  console.log('\nkeyrest listening at http:// ' + opts.host + ':' + opts.port + '\n');

  return control;
};
