"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    assert = require('assert'),
    request = require('request'),
    http = require('http'),
    lastReqAddress;



describe('RPC style tests', function() {


  describe('RPC Literal', function() {
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

    //rpc/literal with complexType input parameters test
    //In case of rpc/literal client request has operation name which in this case is 'setLastTradePrice'
    //within it is input parameter.
    //reference -> https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing4
    //client request - body
    /*
    <soap:Body>
      <setLastTradePrice>
        <tradePrice>100</tradePrice>
      </setLastTradePrice>
    </soap:Body>
     */

    //response body

    //"WS-I's Basic Profile dictates that in the RPC/literal response message, the name of the child
    //of soap:body is has wsdl:operation name suffixed with the string 'Response' which in this test case
    //is setLastTradePriceResponse" " Reference --> https://www.ibm.com/developerworks/library/ws-whichwsdl/ under
    //'SOAP response messages' section.
    /*
    <soap:Body>
      <setLastTradePriceResponse>
        <result>true</result>
      </setLastTradePriceResponse>
    </soap:Body>
    */

  it('RPC Literal with ComplexType test', function(done) {
    soap.createClient(test.baseUrl + '/stockquoterpc?wsdl', function(err, client) {
      assert.ok(!err);
      //pass in the input param which in this case is complexType param tradePrice
      client.setLastTradePrice( {tradePrice: 100}, function(err, result, body) {
        assert.ok(!err);
        assert.ok(result.result);
        done();
      });
    });
  });

});


  describe('RPC Literal', function() {

    var test = {};
    test.server = null;
    test.service = {
      RPCLiteralService: {
        RpcLiteralTestPort: {
          myMethod: function(args, cb, soapHeader) {
          }
        }
      }
    };

    before(function(done) {
      fs.readFile(__dirname + '/wsdl/strict/rpc_literal_test.wsdl', 'utf8', function(err, data) {
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
        test.soapServer = soap.listen(test.server, '/rpc_literal_test', test.service, test.wsdl);
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

    //rpc/literal with simpleType parameters test
    /* In case of rpc/literal client request is wrapped with operation name which in this case is 'myMethod'
    //see https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing4
     <soap:Body>
        <myMethod>
          <x>100</x>
          <y>10.55</y>
        </myMethod>
     </soap:Body>

    server response
    //body="" since this is a one-way request
    //result (output param inside the body) is null
    */
    it('RPC/Literal Simple type test', function(done) {
      soap.createClient(test.baseUrl + '/rpc_literal_test?wsdl', function(err, client) {
        assert.ok(!err);
        //see wsdl. input message has 2 parts = x=int and y=float which gets passed to client method as params.
        client.myMethod( {x: 100, y: 10.55}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(!result);
          done();
        });
      });
    });

  });

  describe('SOAP Server', function() {

    var test = {};
    test.server = null;
    test.service = {
      RPCEncodedService: {
        RpcEncodedTestPort: {
          myMethod: function(args, cb, soapHeader) {
          }
        }
      }
    };

    before(function(done) {
      fs.readFile(__dirname + '/wsdl/strict/rpc_encoded_test.wsdl', 'utf8', function(err, data) {
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
        test.soapServer = soap.listen(test.server, '/rpc_encoded_test', test.service, test.wsdl);
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

    //RPC/encoded is not supported by the code currently. Revisit and fix the code to enable this test, when time permits.
    //What's missing is, in the request/response current code doesn't add xsi:type to x and y parameters in below request.
    //There is code already to determine if the binding is RPC/encoded.

    //rpc/encoded with simpleType parameters test
    /* Expected client request envelope
     //reference https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing2
     <soap:Body>
        <myMethod>
          <x xsi:type="xsd:int">100</x>
          <y xsi:type="xsd:float">10.55</y>
        </myMethod>
     </soap:Body>

     server response
     //body="" since this is a one-way request
     //result (data inside the body) is null
     */
    it.skip('RPC/Encoded style test', function(done) {
      soap.createClient(test.baseUrl + '/rpc_encoded_test?wsdl', function(err, client) {
        assert.ok(!err);
        //see wsdl. input message has 2 parts = x=int and y=float. Pass them as params.
        client.myMethod( {x: 100, y: 10.55}, function(err, result, body) {
          assert.ok(!err);
          assert.ok(!result);
          done();
        });
      });
    });

  });

});


