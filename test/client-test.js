'use strict';

var fs = require('fs'),
    soap = require('..').soap,
    http = require('http'),
    WSDL = soap.WSDL,
    assert = require('assert'),
    QName = require('..').QName;

describe('SOAP Client', function() {
  it('should error on invalid host', function(done) {
    soap.createClient('http://localhost:1', function(err, client) {
      assert.ok(err);
      done();
    });
  });

  it('should add and clear soap headers', function(done) {
    soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
      assert.ok(client);
      assert.ok(client.getSoapHeaders().length === 0);

      var i1 = client.addSoapHeader('about-to-change-1');
      var i2 = client.addSoapHeader('about-to-change-2');

      assert.ok(i1 === 0);
      assert.ok(i2 === 1);
      assert.ok(client.getSoapHeaders().length === 2);

      client.changeSoapHeader(0,'header1');
      client.changeSoapHeader(1,'header2');
      assert.ok(client.getSoapHeaders()[0].xml === 'header1');
      assert.ok(client.getSoapHeaders()[1].xml === 'header2');

      client.clearSoapHeaders();
      assert.ok(client.getSoapHeaders().length == 0);
      done();
    });
  });

  it('should issue async callback for cached wsdl', function(done) {
    var called = false;
    soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
      assert.ok(client);
      assert.ok(!err);
      called = true;
      done();
    });
    assert(!called);
  });

  it('should allow customization of httpClient', function(done) {
    var myHttpClient =  {
      request: function() {}
    };
    soap.createClient(__dirname + '/wsdl/default_namespace.wsdl',
      {httpClient: myHttpClient},
      function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        assert.equal(client.httpClient, myHttpClient);
        done();
      });
  });

  it('should allow customization of request for http client', function(done) {
    var myRequest = function() {
    };
    soap.createClient(__dirname + '/wsdl/default_namespace.wsdl',
      {request: myRequest},
      function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        assert.equal(client.httpClient._request, myRequest);
        done();
      });
  });

  it('should allow customization of envelope', function(done) {
    soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', {envelopeKey: 'soapenv'}, function(err, client) {
      assert.ok(client);
      assert.ok(!err);

      client.MyOperation({}, function(err, result) {
        assert.notEqual(client.lastRequest.indexOf('xmlns:soapenv='), -1);
        done();
      });
    });
  });

  it('should set binding style to "document" by default if not explicitly set in WSDL, per SOAP spec', function (done) {
    soap.createClient(__dirname+'/wsdl/binding_document.wsdl', function(err, client) {
      assert.ok(client);
      assert.ok(!err);

      assert.ok(client.wsdl.definitions.bindings.mySoapBinding.style === 'document');
      done();
    });
  });

  describe('Create a client from a wsdl preloaded in the options', function() {

    var defaultNamespaceWsdl;

    beforeEach(function(done) {

      // Read the contents of the WSDL from the file system
      fs.readFile(__dirname + '/wsdl/default_namespace.wsdl', 'utf8', function (err, defaultNamespaceWsdlContents) {
        if (err) {
          done(err);
        } else {

          var options = {
            WSDL_CACHE: {}
          };
          // Create the initial wsdl directly
          defaultNamespaceWsdl = new WSDL(defaultNamespaceWsdlContents, undefined, {});

          // Load the wsdl fully once its been created in memory
          defaultNamespaceWsdl.load(function () {
            assert.equal(defaultNamespaceWsdl.definitions.$name, "MyService");
          });
          done();
        }
      });
    });

    it('should successfully create a client based on the wsdl in the options', function(done) {

      var options = {
        WSDL_CACHE: {
          preloadedCachedWsdl: defaultNamespaceWsdl
        }
      };
      soap.createClient('preloadedCachedWsdl', options, function(err, client) {

        assert.ok(client);
        assert.ok(client.getSoapHeaders().length === 0);

        // Preform the same tests from "should add and clear soap headers"
        // to verify client was created ok.

        var i1 = client.addSoapHeader('about-to-change-1');
        var i2 = client.addSoapHeader('about-to-change-2');

        assert.ok(i1 === 0);
        assert.ok(i2 === 1);
        assert.ok(client.getSoapHeaders().length === 2);

        client.changeSoapHeader(0,'header1');
        client.changeSoapHeader(1,'header2');
        assert.ok(client.getSoapHeaders()[0].xml === 'header1');
        assert.ok(client.getSoapHeaders()[1].xml === 'header2');

        client.clearSoapHeaders();
        assert.ok(client.getSoapHeaders().length === 0);
        done();
      });
    });
  });

  describe('Headers in request and last response', function() {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;
    var rawBody = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><Response>temp response</Response></soap:Body></soap:Envelope>';

    before(function(done) {
      server = http.createServer(function (req, res) {
        var status_value = (req.headers['test-header'] === 'test') ? 'pass' : 'fail';

        res.setHeader('status', status_value);
        res.statusCode = 200;
        //res.write(JSON.stringify({tempResponse: 'temp'}), 'utf8');
        res.write(rawBody);
        res.end();
      }).listen(port, hostname, done);
    });

    after(function(done) {
      server.close();
      server = null;
      done();
    });

    it('should append port '   + 'to the Host header on for a request to a service on that port', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.notEqual(client.lastRequestHeaders.Host.indexOf(':' + server.address().port ), -1);

          done();
        }, null, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should not append `:80` to the Host header on for a request to a service without a port explicitly defined', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.equal(client.lastRequestHeaders.Host.indexOf(':80'), -1);

          done();
        }, null, {'test-header': 'test'});
      }, 'http://127.0.0.1');
    });

    it('should not append `:443` to the Host header if endpoints runs on `https`', function (done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function() {
          assert.equal(client.lastRequestHeaders.Host.indexOf(':443'), -1);
          done();
        }, null, {'test-header': 'test'});
      }, 'https://127.0.0.1');
    });

    it('should append a port to the Host header if explicitly defined', function (done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function() {
          assert.ok(client.lastRequestHeaders.Host.indexOf(':443') > -1);
          done();
        }, null, {'test-header': 'test'});
      }, 'https://127.0.0.1:443');
    });

    it('should have the correct extra header in the request', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.ok(result);
          assert.ok(client.lastResponseHeaders);
          assert.equal(client.lastResponseHeaders.status, 'pass');

          done();
        }, null, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should have the wrong extra header in the request', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.ok(result);
          assert.ok(client.lastResponseHeaders);
          assert.equal(client.lastResponseHeaders.status, 'fail');

          done();
        }, null, {'test-header': 'testBad'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should have lastResponse and lastResponseHeaders after the call', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.ok(result);
          assert.ok(client.lastResponse);
          assert.ok(client.lastResponseHeaders);

          done();
        }, null, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should have lastElapsedTime after a call with the time option passed', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.ok(result);
          assert.ok(client.lastResponse);
          assert.ok(client.lastResponseHeaders);
          assert.ok(client.lastElapsedTime);

          done();
        }, {time: true}, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should add http headers in method call options', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result) {
          assert.ok(result);
          assert.ok(client.lastRequestHeaders['test-header']);
          assert.ok(client.lastRequestHeaders['options-test-header']);

          done();
        }, {headers: {'options-test-header': 'test'}}, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should add soap headers', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        assert.ok(client);
        assert.ok(client.getSoapHeaders().length === 0);
        var soapheader = {
          'esnext': false,
          'moz': true,
          'boss': true,
          'node': true,
          'validthis': true,
          'globals': {
            'EventEmitter': true,
            'Promise': true
          }
        };

        var qname = new QName('{http://www.example.com/v1}MyHeaderElem');
        client.addSoapHeader(soapheader, qname);

        //lastRequest should have proper header value of above JSON header object serialized based on header schema defined
        //in default-namespace1.wsdl
        var lastRequest = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Header>\n    <ns1:MyHeaderElem xmlns:ns1=\"http://www.example.com/v1\">\n      <ns1:esnext>false</ns1:esnext>\n"
        + "      <ns1:moz>true</ns1:moz>\n      <ns1:boss>true</ns1:boss>\n      <ns1:node>true</ns1:node>\n      <ns1:validthis>true</ns1:validthis>\n      <ns1:globals>\n        <ns1:EventEmitter>true</ns1:EventEmitter>\n        <ns1:Promise>true</ns1:Promise>\n      </ns1:globals>\n"
        + "    </ns1:MyHeaderElem>\n  </soap:Header>\n  <soap:Body/>\n</soap:Envelope>";
        client.MyOperation({}, function(err, result) {
          //using lastRequest instead of lastRequestHeaders() since this doesn't contain soap header which this test case needs to test.
          assert.equal(client.lastRequest, lastRequest);
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should add soap headers with a namespace', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(client.getSoapHeaders().length === 0);

        var qname = new QName('{http://www.example.com/v1}header1');
        client.addSoapHeader({header1: 'content'}, qname);

        //lastRequest should have proper header value of above JSON header object serialized based on header schema defined
        //in default-namespace1.wsdl
        var lastRequest = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Header>\n    <header1>content</header1>\n  </soap:Header>\n  <soap:Body/>\n</soap:Envelope>';
        client.MyOperation({}, function(err, result) {
          //using lastRequest instead of lastRequestHeaders() since this doesn't contain soap header which this test case needs to test.
          assert.equal(client.lastRequest, lastRequest);
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port  );
    });

    it('should not return error in the call and return the json in body', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result, body) {
          assert.ok(result);
          assert.ok(!err);
          assert.ok(body);
          done();
        }, null, {"test-header": 'test'});
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should add proper headers for soap12', function(done) {
      soap.createClient(__dirname+'/wsdl/default_namespace_soap12.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result, envelope) {
          assert.ok(result);
          assert.ok(client.lastRequestHeaders);
          assert.ok(client.lastRequest);
          assert.equal(client.lastRequestHeaders['Content-Type'], 'application/soap+xml; charset=utf-8');
          assert.notEqual(client.lastRequest.indexOf('xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\"'), -1);
          assert( !client.lastRequestHeaders.SOAPAction );
          done();
        }, null, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method with args, callback, options and extra headers', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({Request: 'temp request'}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(client.lastResponseHeaders.status === 'pass');
          assert.ok(client.lastRequestHeaders['options-test-header'] === 'test');

          done();
        }, {headers: {'options-test-header': 'test'}}, {'test-header': 'test'});
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method with only a callback', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({Request: 'temp request'}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(client.lastResponseHeaders.status === 'fail');

          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method with args, options and callback last', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({Request: 'temp request'}, {headers: {'options-test-header': 'test'}}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(client.lastResponseHeaders.status === 'fail');
          assert.ok(client.lastRequestHeaders['options-test-header'] === 'test');

          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method with args, options, extra headers and callback last', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({Request: 'temp request'}, {headers: {'options-test-header': 'test'}}, {'test-header': 'test'}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(client.lastResponseHeaders.status === 'pass');
          assert.ok(client.lastRequestHeaders['options-test-header'] === 'test');

          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method as a promise with no arguments', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        client.MyOperation().then(({result, envelope}) => {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(envelope === rawBody);
          assert.ok(client.lastResponseHeaders.status === 'fail');
          done();
        }, done).catch(done);
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method as a promise with only args', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        client.MyOperation({Request: 'temp request'}).then(({result, envelope}) => {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(envelope === rawBody);
          assert.ok(client.lastResponseHeaders.status === 'fail');
          done();
        }, done).catch(done);
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method as a promise with args and options', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        client.MyOperation({Request: 'temp request'}, {headers: {'options-test-header': 'test'}}).then(({result, envelope}) => {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(envelope === rawBody);
          assert.ok(client.lastResponseHeaders.status === 'fail');
          assert.ok(client.lastRequestHeaders['options-test-header'] === 'test');
          done();
        }, done).catch(done);
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should allow calling the method as a promise with args, options, and extra headers', function(done) {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);
        client.MyOperation({Request: 'temp request'}, {headers: {'options-test-header': 'test'}}, {'test-header': 'test'}).then(({result, envelope, soapHeader}) => {
          assert.ok(!err);
          assert.ok(result);
          assert.ok(result === 'temp response');
          assert.ok(envelope === rawBody);
          assert.ok(client.lastResponseHeaders.status === 'pass');
          assert.ok(client.lastRequestHeaders['options-test-header'] === 'test');
          assert.ok(client.lastRequestHeaders['test-header'] === 'test');
          done();
        }, done).catch(done);
      }, 'http://' + hostname + ':' + server.address().port);
    });
  });




  it('should add http headers', function(done) {
    soap.createClient(__dirname+'/wsdl/default_namespace.wsdl', function(err, client) {
      assert.ok(client);
      assert.ok(client.getHttpHeaders());

      client.addHttpHeader('foo', 'bar');

      assert.ok(client.getHttpHeaders());
      assert.equal(client.getHttpHeaders().foo, 'bar');

      client.clearHttpHeaders();
      assert.equal(Object.keys(client.getHttpHeaders()).length, 0);
      done();
    });
  });

  describe('Namespace number', function() {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;

    before(function(done) {
      server = http.createServer(function (req, res) {
        res.statusCode = 200;
        res.write(JSON.stringify({tempResponse: 'temp'}), 'utf8');
        res.end();
      }).listen(port, hostname, done);
    });

    after(function(done) {
      server.close();
      server = null;
      done();
    });

    it('should reset the namespace number', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        assert.ok(client);

        //in the new implementation xsiType has to be defined in the format below.
        var data = {
          Request: {
            $attributes: {
              $xsiType: "{xmlnsTy}Ty"
            }
          }
        };

        //In the new implementation the xsi:type results in the following format.
        var message = '<soap:Body>\n  <ns1:Request xmlns:ns1=\"http://www.example.com/v1\" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="xmlnsTy" xsi:type="ns2:Ty"/>\n</soap:Body>\n';
        client.MyOperation(data, function(err, result) {
          assert.ok(client.lastRequest);
          assert.ok(client.lastMessage);
          assert.ok(client.lastEndpoint);
          assert.equal(client.lastMessage.toString(), message);

          //test removing the xsiType. The resulting Request shouldn't have the attribute xsiType
          var newData = {
            Request: {
              $attributes: {

              }
            }
          };

          var newMessage = '<soap:Body>\n  <ns1:Request xmlns:ns1=\"http://www.example.com/v1\"/>\n</soap:Body>\n';
          client.MyOperation(newData, function(err, result) {
            assert.ok(client.lastRequest);
            assert.ok(client.lastMessage);
            assert.ok(client.lastEndpoint);
            assert.equal(client.lastMessage, newMessage);

            done();
          });
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });
  });

  describe('Follow even non-standard redirects', function() {
    var server1 = null;
    var server2 = null;
    var server3 = null;
    var hostname = '127.0.0.1';
    var port = 15099;
    var baseUrl = 'http://' + hostname + ':' + port;

    before(function(done) {
      server1 = http.createServer(function (req, res) {
        res.statusCode = 301;
        res.setHeader('Location', 'http://' + hostname + ':' + (port+1));
        res.end();
      }).listen(port, hostname, function() {
        server2 = http.createServer(function (req, res) {
          res.statusCode = 302;
          res.setHeader('Location', 'http://' + hostname + ':' + (port+2));
          res.end();
        }).listen((port+1), hostname, function() {
          server3 = http.createServer(function (req, res) {
            res.statusCode = 401;
            res.write(JSON.stringify({tempResponse: 'temp'}), 'utf8');
            res.end();
          }).listen((port+2), hostname, done);
        });
      });
    });

    after(function(done) {
      server1.close();
      server2.close();
      server3.close();
      server1 = null;
      server2 = null;
      server3 = null;
      done();
    });

    it('should return an error', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        client.MyOperation({}, function(err, result) {
          assert.ok(err);
          assert.ok(err.response);
          assert.equal(err.body, '{"tempResponse":"temp"}');
          done();
        });
      }, baseUrl);
    });
  });

  describe('Handle non-success http status codes', function() {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;


    before(function(done) {
      server = http.createServer(function (req, res) {
        res.statusCode = 401;
        res.write(JSON.stringify({tempResponse: 'temp'}), 'utf8');
        res.end();
      }).listen(port, hostname, done);
    });

    after(function(done) {
      server.close();
      server = null;
      done();
    });

    it('should return an error', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        client.MyOperation({}, function(err, result) {
          assert.ok(err);
          assert.ok(err.response);
          assert.ok(err.body);
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });

    it('should emit a \'soapError\' event', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        client.on('soapError', function(err) {
          assert.ok(err);
        });
        client.MyOperation({}, function(err, result) {
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });
  });

  describe('Handle HTML answer from non-SOAP server', function() {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;


    before(function(done) {
      server = http.createServer(function (req, res) {
        res.statusCode = 200;
        res.write('<html><body></body></html>', 'utf8');
        res.end();
      }).listen(port, hostname, done);
    });

    after(function(done) {
      server.close();
      server = null;
      done();
    });

    it('should return an error', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        client.MyOperation({}, function(err, result) {
          assert.ok(err);
          assert.ok(err.response);
          assert.ok(err.body);
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });
  });

  describe('Client Events', function () {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;


    before(function(done) {
      server = http.createServer(function (req, res) {
        res.statusCode = 200;
        fs.createReadStream(__dirname + '/soap-failure.xml').pipe(res);
      }).listen(port, hostname, done);
    });

    after(function(done) {
      server.close();
      server = null;
      done();
    });

    it('Should emit the "message" event with Soap Body string', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        var didEmitEvent = false;
        client.on('message', function (xml) {
          didEmitEvent = true;
          // Should contain only message body
          assert.equal(typeof xml, 'string');
          assert.equal(xml.indexOf('soap:Envelope'), -1);
        });

        client.MyOperation({}, function() {
          assert.ok(didEmitEvent);
          done();
        });
      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('Should emit the "request" event with entire XML message', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        var didEmitEvent = false;
        client.on('request', function (xml) {
          didEmitEvent = true;
          // Should contain entire soap message
          assert.equal(typeof xml, 'string');
          assert.notEqual(xml.indexOf('soap:Envelope'), -1);
        });

        client.MyOperation({}, function() {
          assert.ok(didEmitEvent);
          done();
        });
      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('Should emit the "response" event with Soap Body string and Response object', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        var didEmitEvent = false;
        client.on('response', function (xml, response) {
          didEmitEvent = true;
          // Should contain entire soap message
          assert.equal(typeof xml, 'string');
          assert.equal(xml.indexOf('soap:Envelope'), -1);
          assert.ok(response);
        });

        client.MyOperation({}, function() {
          assert.ok(didEmitEvent);
          done();
        });
      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should emit a \'soapError\' event', function (done) {
      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        var didEmitEvent = false;
        client.on('soapError', function(err) {
          didEmitEvent = true;
          assert.ok(err.root.Envelope.Body.Fault);
        });
        client.MyOperation({}, function(err, result) {
          assert.ok(didEmitEvent);
          done();
        });
      }, 'http://' + hostname + ":" + server.address().port);
    });

  });

  it('should return error in the call when Fault was returned', function(done) {
    var server = null;
    var hostname = '127.0.0.1';
    var port =  0;

    server = http.createServer(function (req, res) {
      res.statusCode = 200;
      res.write("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"\n  xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\"\n  xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n  xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\">\n<SOAP-ENV:Body><SOAP-ENV:Fault><faultcode xsi:type=\"xsd:string\">Test</faultcode><faultactor xsi:type=\"xsd:string\"></faultactor><faultstring xsi:type=\"xsd:string\">test error</faultstring><detail xsi:type=\"xsd:string\">test detail</detail></SOAP-ENV:Fault></SOAP-ENV:Body></SOAP-ENV:Envelope>");
      res.end();
    }).listen(port, hostname, function() {
      soap.createClient(__dirname+'/wsdl/json_response.wsdl', function(err, client) {
        assert.ok(client);
        assert.ok(!err);

        client.MyOperation({}, function(err, result, body) {
          server.close();
          server = null;
          assert.ok(err);
          assert.strictEqual(err.message, 'faultcode: Test faultstring: test error detail: test detail');
          assert.ok(result);
          assert.ok(body);
          done();
        });
      }, 'http://' + hostname + ':' + server.address().port);
    });

  });

});
