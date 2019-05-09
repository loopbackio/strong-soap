// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
  StockQuoteService: {
    StockQuotePort: {
      GetLastTradePrice: function(args, cb, soapHeader) {
        if (soapHeader)
          return {TradePrice: {price: soapHeader.SomeToken }};
        if (args.tickerSymbol === 'trigger error') {
          throw new Error('triggered server error');
        } else if (args.tickerSymbol === 'Async') {
          return cb({ TradePrice: {price: 19.56 }});
        } else if (args.tickerSymbol === 'SOAP Fault v1.2') {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" }
              },
              Reason: { Text: "Processing Error" }
            }
          };
        } else if (args.tickerSymbol === 'SOAP Fault v1.1') {
          throw {
            Fault: {
              faultcode: "soap:Client.BadArguments",
              faultstring: "Error while processing arguments"
            }
          };
        } else if (args.tickerSymbol === 'AAPL') {
            var jsonResponse = {TradePrice: {"price": "19.56"}};
            return jsonResponse;
          }
        },

      SetTradePrice: function(args, cb, soapHeader) {
      },

      IsValidPrice: function(args, cb, soapHeader, req) {
        lastReqAddress = req.connection.remoteAddress;

        var validationError = {
          Fault: {
            Code: {
              Value: "soap:Sender",
              Subcode: { value: "rpc:BadArguments" }
            },
            Reason: { Text: "Processing Error" },
            statusCode: 500
          }
        };

        var isValidPrice = function() {
          var price = args.price;
          if(isNaN(price) || (price === ' ')) {
            return cb(validationError);
          }

          price = parseInt(price, 10);
          var validPrice = (price > 0 && price < Math.pow(10, 5));
          return cb(null, { valid: validPrice });
        };

        setTimeout(isValidPrice, 10);
      }
      }
    }
};

describe('SOAP Server', function() {
  before(function(done) {
    fs.readFile(__dirname + '/wsdl/strict/stockquote.wsdl', 'utf8', function(err, data) {
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
      test.soapServer = soap.listen(test.server, '/stockquote', test.service, test.wsdl);
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


  it('should add and clear response soap headers', function(done) {
    assert.ok((test.soapServer.getSoapHeaders().length === 0));

    var i1 = test.soapServer.addSoapHeader('about-to-change-1');
    var i2 = test.soapServer.addSoapHeader('about-to-change-2');

    assert.ok(i1 === 0);
    assert.ok(i2 === 1);
    assert.ok(test.soapServer.getSoapHeaders().length === 2);

    test.soapServer.changeSoapHeader(0,'header1');
    test.soapServer.changeSoapHeader(1,'header2');
    assert.ok(test.soapServer.getSoapHeaders()[0].xml === 'header1');
    assert.ok(test.soapServer.getSoapHeaders()[1].xml === 'header2');

    test.soapServer.clearSoapHeaders();
    assert.ok(test.soapServer.getSoapHeaders().length === 0);
    done();
  });

  it('should return predefined headers in response', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err)

      test.soapServer.addSoapHeader('<header1>ONE</header1>');

      test.soapServer.changeSoapHeader(1, { header2: 'TWO' });
      client.GetLastTradePrice({TradePriceRequest: { tickerSymbol: 'AAPL'}}, function(err, result, raw, headers) {
        assert.ok(!err);
        assert.deepEqual(headers, { header1: 'ONE', header2: 'TWO' });
        done();
      });
    });
  });

  it('should be running', function(done) {
    request(test.baseUrl, function(err, res, body) {
      assert.ok(!err);
      done();
    });
  });

  it('should 404 on non-WSDL path', function(done) {
    request(test.baseUrl, function(err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 404);
      done();
    });
  });

  it('should 500 on wrong message', function(done) {
    request.post({
        url: test.baseUrl + '/stockquote?wsdl',
        body : '<soapenv:Envelope' +
                    ' xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"' +
                    ' xmlns:soap="http://service.applicationsnet.com/soap/">' +
                '  <soapenv:Header/>' +
                '  <soapenv:Body>' +
                '    <soap:WrongTag/>' +
                '  </soapenv:Body>' +
                '</soapenv:Envelope>',
        headers: {'Content-Type': 'text/xml'}
      }, function(err, res, body) {
        if (err) {
          console.error(err);
        }
        assert.ok(!err);
        assert.equal(res.statusCode, 500);
        assert.ok(body.length);
        done();
      }
    );
  });

  it('should 500 on missing tag message', function(done) {
    request.post({
        url: test.baseUrl + '/stockquote?wsdl',
        body : '<soapenv:Envelope' +
                    ' xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"' +
                    ' xmlns:soap="http://service.applicationsnet.com/soap/">' +
                '  <soapenv:Header/>' +
                '  <soapenv:Body>' +
                '</soapenv:Envelope>',
        headers: {'Content-Type': 'text/xml'}
      }, function(err, res, body) {
        assert.ok(!err);
        assert.equal(res.statusCode, 500);
        assert.ok(body.length);
        done();
      }
    );
  });

  it('should server up WSDL', function(done) {
    request(test.baseUrl + '/stockquote?wsdl', function(err, res, body) {
      if (err) {
        console.error(err);
      }
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      assert.ok(body.length);
      done();
    });
  });

  it('should return complete client description', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      var description = client.describe();
      assert.equal(description.StockQuoteService.StockQuotePort.GetLastTradePrice.input.body.elements[0].qname.name,'TradePriceRequest');
      assert.equal(description.StockQuoteService.StockQuotePort.GetLastTradePrice.input.body.elements[0].elements[0].qname.name,'tickerSymbol');
      assert.equal(description.StockQuoteService.StockQuotePort.GetLastTradePrice.input.body.elements[0].elements[0].type.name,'string');
      done();
    });
  });

  it('should return correct results', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({TradePriceRequest: { tickerSymbol: 'AAPL'}}, function(err, result) {
        assert.ok(!err);
        assert.equal(19.56, parseFloat(result.price));
        done();
      });
    });
  });

  it('should return correct async results (single argument callback style)', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({TradePriceRequest: { tickerSymbol: 'Async'}}, function(err, result, body) {
        assert.ok(!err);
        assert.equal(19.56, parseFloat(result.price));
        done();
      });
    });
  });


  it('should return correct async results (double argument callback style)', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.IsValidPrice({ TradePrice: {price: 50000 } }, function(err, result) {
        assert.ok(!err);
        assert.equal(true, !!(result));
        done();
      });
    });
  });

  it('should pass the original req to async methods', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.IsValidPrice({TradePrice: {price: 50000 }}, function(err, result) {
        // node V3.x+ reports addresses as IPV6
        var addressParts = lastReqAddress.split(':');
        addressParts[(addressParts.length - 1)].should.equal('127.0.0.1');
        done();
      });
    });
  });

  it('should return correct async errors', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.IsValidPrice({TradePrice: { price: "invalid_price"}}, function(err, result) {
        assert.ok(err);
        assert.ok(err.root.Envelope.Body.Fault);
        assert.equal(err.response.statusCode, 500);
        done();
      });
    });
  });

  it('should handle headers in request', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.addSoapHeader('<SomeToken>123.45</SomeToken>');
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'AAPL'}}, function(err, result) {
        assert.ok(!err);
        assert.equal(123.45, parseFloat(result.price));
        done();
      });
    });
  });

  it('should return security timestamp in response', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.addSoapHeader('<Security><Timestamp><Created>2015-02-23T12:00:00.000Z</Created><Expires>2015-02-23T12:05:00.000Z</Expires></Timestamp></Security>');
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'AAPL'}}, function(err, result, raw, soapHeader) {
        assert.ok(!err);
        assert.ok(soapHeader && soapHeader.Security && soapHeader.Security.Timestamp);
        done();
      });
    });
  });

  it('should emit \'request\' event', function(done) {
    test.soapServer.on('request', function requestManager(request, methodName) {
      assert.equal(methodName, 'GetLastTradePrice');
      done();
    });
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({TradePriceRequest: {tickerSymbol: 'AAPL'}}, function() {});
    });
  });

  it('should emit \'headers\' event', function(done) {
    test.soapServer.on('headers', function headersManager(headers, methodName) {
      assert.equal(methodName, 'GetLastTradePrice');
      headers.SomeToken = 0;
    });
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.addSoapHeader('<SomeToken>123.45</SomeToken>');
      client.GetLastTradePrice({TradePriceRequest: { tickerSymbol: 'AAPL'}}, function(err, result) {
        assert.ok(!err);
        assert.equal(0, parseFloat(result.price));
        done();
      });
    });
  });

  it('should not emit the \'headers\' event when there are no headers', function(done) {
    test.soapServer.on('headers', function headersManager(headers, methodName) {
      assert.ok(false);
    });
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'AAPL'}}, function(err, result) {
        assert.ok(!err);
        done();
      });
    });
  });

  it('should include response and body in error object', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({TradePriceRequest: {tickerSymbol: 'trigger error' }}, function(err, response, body) {
        assert.ok(err);
        assert.strictEqual(err.response, response);
        assert.strictEqual(err.body, body);
        done();
      });
    });
  });

  it('should return SOAP Fault body for SOAP 1.2', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      var expectedBody = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Header/>\n  <soap:Body>\n    <soap:Fault>\n      <Code>\n        <Value>soap:Sender</Value>\n        <Subcode>\n          <value>rpc:BadArguments</value>\n        </Subcode>\n      </Code>\n      <Reason>\n        <Text>Processing Error</Text>\n      </Reason>\n    </soap:Fault>\n  </soap:Body>\n</soap:Envelope>';
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'SOAP Fault v1.2' }}, function(err, response, body) {
        assert.ok(err);
        var fault = err.root.Envelope.Body.Fault;
        assert.equal(fault.Code.Value, "soap:Sender");
        assert.equal(fault.Reason.Text, "Processing Error");
        assert.equal(body.toString(), expectedBody);
        assert.equal(err.response.statusCode, 200);
        done();
      });
    });
  });

  it('should return SOAP Fault body for SOAP 1.1', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'SOAP Fault v1.1' }}, function(err, response, body) {
        assert.ok(err);
        var fault = err.root.Envelope.Body.Fault;
        assert.equal(err.message, 'faultcode: ' + fault.faultcode + ' ' + 'faultstring: ' + fault.faultstring);
        assert.equal(fault.faultcode, "soap:Client.BadArguments");
        assert.equal(fault.faultstring, "Error while processing arguments");
        // Verify namespace on elements set according to fault spec 1.1
        //revisit soap: namespace for below elements. Current code either can add soap: for <Fault> including every child element
        //under <Fault> or NOT add soap: for <Fault> including every child element under <Fault>.
        assert.ok(body.match(/<faultcode>.*<\/faultcode>/g),
          "Body should contain faultcode-element without namespace");
        assert.ok(body.match(/<faultstring>.*<\/faultstring>/g),
          "Body should contain faultstring-element without namespace");
        done();
      });
    });
  });

  it('should return SOAP Fault thrown from \'headers\' event handler', function(done) {
    test.soapServer.on('headers', function headersManager() {
      throw {
        Fault: {
          Code: {
            Value: "soap:Sender",
            Subcode: { value: "rpc:BadArguments" }
          },
          Reason: { Text: "Processing Error" }
        }
      };
    });
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      client.addSoapHeader('<SomeToken>0.0</SomeToken>');
      client.GetLastTradePrice({ TradePriceRequest: {tickerSymbol: 'AAPL'}}, function(err, result) {
        assert.ok(err);
        assert.ok(err.root.Envelope.Body.Fault);
        done();
      });
    });
  });

  it('should handle one-way operations', function(done) {
    soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
      assert.ok(!err);
      client.SetTradePrice({ TradePriceSubmit: {tickerSymbol: 'GOOG', price: 575.33 }}, function(err, result) {
        assert.ok(!err);
        assert.equal(result,null);
        done();
      });
    });
  });

// NOTE: this is actually a -client- test
/*
it('should return a valid error if the server stops responding': function(done) {
  soap.createClient(test.baseUrl + '/stockquote?wsdl', function(err, client) {
    assert.ok(!err);
    server.close(function() {
      server = null;
      client.GetLastTradePrice({ tickerSymbol: 'trigger error' }, function(err, response, body) {
        assert.ok(err);
        done();
      });
    });
  });
});
*/

});
