"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    assert = require('assert'),
    request = require('request'),
    http = require('http'),
    lastReqAddress;

var test = {};
test.server = null;
test.service = {
  StockQuoteServiceRPC: {
    StockQuotePortRPC: {
      setLastTradePrice: function(args, cb, soapHeader) {
      if (args.tradePrice) {
            var jsonResponse = {"result": true};
            return jsonResponse;
        }
      }
      }
    }
};

describe('SOAP Server', function() {
  before(function(done) {
    fs.readFile(__dirname + '/wsdl/strict/stockquoterpc.wsdl', 'utf8', function(err, data) {
      assert.ok(!err);
      test.wsdl = data;
      done();
    });
  });

  beforeEach(function(done) {
    test.server = http.createServer(function(req, res) {
      res.statusCode = 404;
      res.end();
    });

    test.server.listen(15099, null, null, function() {
      test.soapServer = soap.listen(test.server, '/stockquoterpc', test.service, test.wsdl);
      test.baseUrl =
        'http://' + test.server.address().address + ":" + test.server.address().port;

      //windows return 0.0.0.0 as address and that is not
      //valid to use in a request
      if (test.server.address().address === '0.0.0.0' || test.server.address().address === '::') {
        test.baseUrl =
          'http://127.0.0.1:' + test.server.address().port;
      }

      done();
    });
  });
  afterEach(function(done) {
    test.server.close(function() {
      test.server = null;
      delete test.soapServer;
      test.soapServer = null;
      done();
    });
  });

  //rpc/literal test
  it('should return correct results', function(done) {
    soap.createClient(test.baseUrl + '/stockquoterpc?wsdl', function(err, client) {
      assert.ok(!err);
      client.setLastTradePrice( {tradePrice: 100}, function(err, result, body) {
        assert.ok(!err);
        assert.ok(result.result);
        done();
      });
    });
  });

});
