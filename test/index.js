var should = require('chai').should(),
    main = require('../index'),
    captureStream = require('./helpers/capture-stream'),
    client = main.client,
    server = main.server;

var protractor = {};

beforeEach(function(){
  global.protractor = {};
});

describe('the client server model', function(){

  it('has a client', function(){
    (typeof client()).should.equal('function');

  });

  it('has a server', function(){
    (typeof server()).should.equal('object');
  });

  describe('logs', function(){
    var stdout;
    beforeEach(function(){
      stdout = captureStream(process.stdout);
    });
    afterEach(function(){
      stdout.release();
    });

    it('can be captured by the test framework', function(){
      stdout.captured().should.equal('');
      console.log('TEST LOG');
      stdout.captured().should.equal('TEST LOG\n');
    });

    it('from the client', function(){
      client();
      stdout.captured().should.equal('');
    });

    it('from the server', function(){
      server();
      stdout.captured().should.equal('\nkeyrest listening at http:// 0.0.0.0:4000\n\n');
    });

  });
});