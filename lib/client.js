var protocol,
    host,
    port;

var isObject = function(object) {
  return typeof object === 'object' && !Array.isArray(object) && object !== null;
};

var controlApi = function controlApi() {
  if (arguments.length > 0 && isObject(arguments[0])) {

    var kvObject = arguments[0],
        cb = arguments[1],

        doKey = function doKey(keys) {
          var key = keys.pop();
          if(keys.length) {
            return keyValueRequest(key, kvObject[key], function() {
              doKey(keys);
            });
          }
          return keyValueRequest(key, kvObject[key], cb);
        };

    return doKey(Object.keys(arguments[0]));

  } else {
    keyValueRequest.apply(this, Array.from(arguments));
  }
};

var keyValueRequest = function keyValueRequest(key, value, cb) {
  var request = require('request'),
      defer = protractor.promise.defer(),
      uriBase = protocol + '://' + host + ':' + port,
      uriPath = '/',
      options = {};

  if(typeof key === 'function') {
    cb = key;
    key = undefined;
  }

  if(typeof value === 'function') {
    cb = value;
    value = undefined;
  }

  if(key) {
    uriPath += key + '/';
  }

  if(value) {
    method = 'PUT';
    uriPath += value;
  } else {
    method = 'DELETE';
  }

  options.method = method;
  options.uri = uriBase + uriPath;

  request(options, function(error, response, body) {

    if(error) {
      // throw error;
      defer.reject(error);
    } else {
      defer.fulfill({
        response: response,
        body: body
      });
    }
  });

  if(cb) {
    defer.promise.then(cb);
  } else {
    return defer.promise;
  }
};

var keyRestClient = function KeyRestClient(config) {
  config = config || {};
  protocol = config.protocol || 'http';
  host = config.host || 'localhost';
  port = config.port || '4000';

  if (typeof protractor === 'undefined') {
    throw 'Global protractor not found';
  }

  return controlApi;
};

module.exports = keyRestClient;