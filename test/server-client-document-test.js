"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    assert = require('assert'),
    request = require('request'),
    http = require('http'),
    lastReqAddress;



describe('Document style tests', function() {


  describe('Document/Literal with simple types param', function () {

    var test = {};
    test.server = null;
    test.service = {
      DocLiteralService: {
        DocLiteralPort: {
          myMethod: function (args, cb, soapHeader) {
            var jsonResponse = {"zElement": true};
            return jsonResponse;
          }
        }
      }
    };

    before(function (done) {
      fs.readFile(__dirname + '/wsdl/strict/doc_literal_test.wsdl', 'utf8', function (err, data) {
        assert.ok(!err);
        test.wsdl = data;
        done();
      });
    });

    beforeEach(function (done) {
      test.server = http.createServer(function (req, res) {
        res.statusCode = 404;
        res.end();
      });

      test.server.listen(15099, null, null, function () {
        test.soapServer = soap.listen(test.server, '/doc_literal_test', test.service, test.wsdl);
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

    afterEach(function (done) {
      test.server.close(function () {
        test.server = null;
        delete test.soapServer;
        test.soapServer = null;
        done();
      });
    });

    //doc/literal with simpleType params test
    /* In case of doc/literal, client request/response is NOT wrapped inside the operation name. Input and output params are
     //defined in the schema/xsd. reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing6

     Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <xElement>100</xElement>
          <yElement>10.55</yElement>
        </soap:Body>
     </soap:Envelope>

     server response
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <zElement>true</zElement>
        </soap:Body>
     </soap:Envelope>
     */

    it('Document/literal test with simpleType params', function (done) {
      soap.createClient(test.baseUrl + '/doc_literal_test?wsdl', function (err, client) {
        assert.ok(!err);
        //see doc_literal_test.wsdl. input message has 2 parts = xElement=int and yElement=float which gets passed as input prams in the client method.
        client.myMethod({xElement: 100, yElement: 10.55}, function (err, result, body) {
          assert.ok(!err);
          //result is output param which in this case is boolean(zElement) and the server sends 'true' for the value. Since it's wrapped inside the operatioName, result itself is the
          //output param/output value.
          assert.ok(result);
          done();
        });
      });
    });

  });

  describe('Document/Literal wrapped with simple type params', function () {

    var test = {};
    test.server = null;
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            var jsonResponse = {"z": true};
            return jsonResponse;
          }
        }
      }
    };

    before(function (done) {
      fs.readFile(__dirname + '/wsdl/strict/doc_literal_wrapped_test.wsdl', 'utf8', function (err, data) {
        assert.ok(!err);
        test.wsdl = data;
        done();
      });
    });

    beforeEach(function (done) {
      test.server = http.createServer(function (req, res) {
        res.statusCode = 404;
        res.end();
      });

      test.server.listen(15099, null, null, function () {
        test.soapServer = soap.listen(test.server, '/doc_literal_wrapped_test', test.service, test.wsdl);
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

    afterEach(function (done) {
      test.server.close(function () {
        test.server = null;
        delete test.soapServer;
        test.soapServer = null;
        done();
      });
    });

    //doc/literal-wrapped test
    /* In case of doc/literal-wrapped input params are wrapped inside the wrapper element which should match
     //the operationName which in the wsdl. Reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing8

     Client Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <myMethod>
            <x>100</x>
            <y>10.55</y>
          </myMethod>
        </soap:Body>
     </soap:Envelope>

     Server Response
     //In Doc/Literal-wrapped, the response  the name of the child of soap:body is, the corresponding wsdl:operation
     //name suffixed with the string 'Response'." Reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing15


     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
            <myMethodResponse>
              <z>true</z>
            </myMethodResponse>
        </soap:Body>
     </soap:Envelope>

     */

    it('Document/literal wrapped test with simpleType params', function (done) {
      soap.createClient(test.baseUrl + '/doc_literal_wrapped_test?wsdl', function (err, client) {
        assert.ok(!err);
        //
        client.myMethod({x: 100, y: 10.55}, function (err, result, body) {
          assert.ok(!err);
          //result is the wrapper object which is myMethodResponse which has output param which is the child element. In this test case, server sends 'true' for the output param 'z'.
          assert.ok(result.z);
          done();
        });
      });
    });


  });

  describe('Document/Literal wrapped with Fault1', function () {

    var test = {};
    test.server = null;
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            throw {
              Fault: {
                faultcode: "sampleFaultCode",
                faultstring: "sampleFaultString",
                detail:
                { myMethodFault1:
                  {errorMessage1: 'MyMethod Business Exception message', value1: 10}
                }
              }
            }
          }
        }
      }
    };

    before(function (done) {
      fs.readFile(__dirname + '/wsdl/strict/doc_literal_wrapped_test.wsdl', 'utf8', function (err, data) {
        assert.ok(!err);
        test.wsdl = data;
        done();
      });
    });

    beforeEach(function (done) {
      test.server = http.createServer(function (req, res) {
        res.statusCode = 404;
        res.end();
      });

      test.server.listen(15099, null, null, function () {
        test.soapServer = soap.listen(test.server, '/doc_literal_wrapped_test', test.service, test.wsdl);
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

    afterEach(function (done) {
      test.server.close(function () {
        test.server = null;
        delete test.soapServer;
        test.soapServer = null;
        done();
      });
    });

    //doc/literal-wrapped test with Fault
    /* In case of doc/literal-wrapped input params are wrapped inside the wrapper element which should match
     //the operationName which in the wsdl. Reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing8

     Client Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <myMethod>
            <x>200</x>
            <y>10.55</y>
          </myMethod>
        </soap:Body>
     </soap:Envelope>

     Server Response
     //Doc/Literal-wrapped with Fault response. In this test case, server sends a Fault response which is returned as an error to the client
     //and also the response envelope should contain <Fault> and <detailt> element should contain element <myMethodFault> defined in the wsdl

     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <soap:Fault>
            <soap:faultcode>sampleFaultCode</soap:faultcode>
            <soap:faultstring>sampleFaultString</soap:faultstring>
            <soap:detail>
              <myMethodFault1>
                <errorMessage1>MyMethod Business Exception message</errorMessage1>
                <value1>10</value1>
              </myMethodFault1>
            </soap:detail>
          </soap:Fault>
        </soap:Body>
     </soap:Envelope>
     */


    it('Document/literal wrapped test with Fault1', function (done) {
      soap.createClient(test.baseUrl + '/doc_literal_wrapped_test?wsdl', function (err, client) {
        assert.ok(!err);
        client.myMethod({x: 200, y: 10.55}, function (err, result, body) {
          assert.ok(err);
          //check if fault exists with correct 'detail' parameters in the response
          
          var index = body.indexOf('myMethodFault1');
          assert.ok(index > -1);
          var index = body.indexOf('<errorMessage1>MyMethod Business Exception message</errorMessage1>');
          assert.ok(index > -1);
          var index = body.indexOf('<value1>10</value1>');
          assert.ok(index > -1);
          done();
        });
      });
    });

  });

  describe('Document/Literal wrapped with Fault2', function () {

    var test = {};
    test.server = null;
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            throw {
              Fault: {
                  faultcode: "sampleFaultCode",
                  faultstring: "sampleFaultString",
                  detail:
                    { myMethodFault2:
                      {errorMessage2: 'MyMethod Business Exception message', value2: 10}
                    }
                }
            }
          }
        }
      }
    };

    before(function (done) {
      fs.readFile(__dirname + '/wsdl/strict/doc_literal_wrapped_test.wsdl', 'utf8', function (err, data) {
        assert.ok(!err);
        test.wsdl = data;
        done();
      });
    });

    beforeEach(function (done) {
      test.server = http.createServer(function (req, res) {
        res.statusCode = 404;
        res.end();
      });

      test.server.listen(15099, null, null, function () {
        test.soapServer = soap.listen(test.server, '/doc_literal_wrapped_test', test.service, test.wsdl);
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

    afterEach(function (done) {
      test.server.close(function () {
        test.server = null;
        delete test.soapServer;
        test.soapServer = null;
        done();
      });
    });

    //doc/literal-wrapped test Fault
    /* In case of doc/literal-wrapped input params are wrapped inside the wrapper element which should match
    //the operationName which in the wsdl. Reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing8


     Client Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
         <soap:Header/>
         <soap:Body>
           <myMethod>
             <x>200</x>
             <y>10.55</y>
           </myMethod>
         </soap:Body>
     </soap:Envelope>

     Server Response
     //Doc/Literal-wrapped with Fault response. In this test case, server sends a Fault response which is returned as an error to the client
     //and also the response envelope should contain <Fault> and <detailt> element should contain element <myMethodFault> defined in the wsdl

     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
            <soap:Fault>
                <soap:faultcode>sampleFaultCode</soap:faultcode>
                <soap:faultstring>sampleFaultString</soap:faultstring>
                <soap:detail>
                  <myMethodFault2>
                      <errorMessage2>MyMethod Business Exception message</errorMessage2>
                      <value2>10</value2>
                  </myMethodFault2>
                </soap:detail>
            </soap:Fault>
        </soap:Body>
     </soap:Envelope>
     */


    it('Document/literal wrapped test with Fault2', function (done) {
      soap.createClient(test.baseUrl + '/doc_literal_wrapped_test?wsdl', function (err, client) {
        assert.ok(!err);
        client.myMethod({x: 200, y: 10.55}, function (err, result, body) {
          assert.ok(err);
          //check if fault exists with correct 'detail' parameters in the response
          var index = body.indexOf('myMethodFault2');
          assert.ok(index > -1);
          var index = body.indexOf('<errorMessage2>MyMethod Business Exception message</errorMessage2>');
          assert.ok(index > -1);
          var index = body.indexOf('<value2>10</value2>');
          assert.ok(index > -1);
          done();
        });
      });
    });

  });

  describe('Document/Literal wrapped with SOAP 1.2 Fault', function () {

    var test = {};
    test.server = null;
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            throw {
              Fault: {
                Code: {
                  Value: "soap:Sender",
                  Subcode: { Value: "rpc:BadArguments" }
                },
                Reason: { Text: "Processing Error" },
                Detail:
                {myMethodFault2:
                   {errorMessage2: 'MyMethod Business Exception message', value2: 10}
                }
              }
            }
          }
        }
      }
    };

    before(function (done) {
      fs.readFile(__dirname + '/wsdl/strict/doc_literal_wrapped_test_soap12.wsdl', 'utf8', function (err, data) {
        assert.ok(!err);
        test.wsdl = data;
        done();
      });
    });

    beforeEach(function (done) {
      test.server = http.createServer(function (req, res) {
        res.statusCode = 404;
        res.end();
      });

      test.server.listen(15099, null, null, function () {
        test.soapServer = soap.listen(test.server, '/doc_literal_wrapped_test_soap12', test.service, test.wsdl);
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

    afterEach(function (done) {
      test.server.close(function () {
        test.server = null;
        delete test.soapServer;
        test.soapServer = null;
        done();
      });
    });

    //doc/literal-wrapped test for soap 1.2 Fault
    /* In case of doc/literal-wrapped input params are wrapped inside the wrapper element which should match
     //the operationName which in the wsdl. Reference - https://www.ibm.com/developerworks/library/ws-whichwsdl/#listing8


     Client Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
        <soap:Header/>
        <soap:Body>
          <ns1:myMethod xmlns:ns1="http://example.com/doc_literal_wrapped_test_soap12.wsdl">
            <x>200</x>
            <y>10.55</y>
          </ns1:myMethod>
        </soap:Body>
     </soap:Envelope>

     Server Response
     //Doc/Literal-wrapped with soap 1.2 Fault response. In this test case, server sends a Fault response which is returned as an error to the client
     //and also the response envelope should contain <Fault> and <Detailt> element should contain element <myMethodFault> defined in the wsdl

     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
       <soap:Header/>
        <soap:Body>
          <soap:Fault>
            <soap:Code>
              <soap:Value>soap:Sender</soap:Value>
              <soap:Subcode>
                <soap:Value>rpc:BadArguments</soap:Value>
              </soap:Subcode>
            </soap:Code>
            <soap:Reason>
              <soap:Text>Processing Error</soap:Text>
            </soap:Reason>
            <soap:Detail>
                <ns1:myMethodFault2 xmlns:ns1="http://example.com/doc_literal_wrapped_test_soap12.wsdl">
                    <errorMessage2>MyMethod Business Exception message</errorMessage2>
                    <value2>10</value2>
                </ns1:myMethodFault2>
            </soap:Detail>
          </soap:Fault>
        </soap:Body>
     </soap:Envelope>

     */


    it('Document/literal wrapped test with Fault2', function (done) {
      soap.createClient(test.baseUrl + '/doc_literal_wrapped_test_soap12?wsdl', function (err, client) {
        assert.ok(!err);
        client.myMethod({x: 200, y: 10.55}, function (err, result, body) {
          assert.ok(err);
          //check for couple of soap 1.2 fault elements
          var index = body.indexOf('<soap:Value>rpc:BadArguments</soap:Value>');
          assert.ok(index > -1);
          var index = body.indexOf('<soap:Text>Processing Error</soap:Text>');
          assert.ok(index > -1);
          //check if fault exists with correct 'Detail' parameters in the response
          var index = body.indexOf('<soap:Detail>');
          assert.ok(index > -1);
          var index = body.indexOf('ns1:myMethodFault2 xmlns:ns1="http://example.com/doc_literal_wrapped_test_soap12.wsdl"');
          assert.ok(index > -1);
          var index = body.indexOf('<errorMessage2>MyMethod Business Exception message</errorMessage2>');
          assert.ok(index > -1);
          var index = body.indexOf('<value2>10</value2>');
          assert.ok(index > -1);
          done();
        });
      });
    });

  });


});


