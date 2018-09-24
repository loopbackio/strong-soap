"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    assert = require('assert'),
    should = require('should'),
    request = require('request'),
    http = require('http'),
    async = require('async'),
    path = require('path');

var openWSDL = require('..').WSDL.open;

describe('wsdl-tests', function() {

  describe('should parse and describe wsdls under /wsdl/strict dir', function () {
    var files = [];

    before(function (done) {
      fs.readdirSync(__dirname + '/wsdl/strict').forEach(function (file) {
        if (!/.wsdl$/.exec(file)) return;
        files.push(file);
      });
      done();
    });

    it('should parse and describe wsdls under /wsdl/strict dir', function (done) {
      async.each(files, function (file, cb) {
        soap.createClient(__dirname + '/wsdl/strict/' + file, {strict: true}, function (err, client) {
          assert.ok(!err);
          client.describe();
          cb(err);
        });
      }, done);
    });

  });

  describe('should parse and describe wsdls directly under /wsdl/ dir', function () {
    var files = [];

    before(function (done) {
      fs.readdirSync(__dirname + '/wsdl/').forEach(function (file) {
        if (!/.wsdl$/.exec(file)) return;
        files.push(file);
      });
      done();
    });

    it('should parse and describe wsdls directly under /wsdl/ dir', function (done) {
      async.each(files, function (file, cb) {
        soap.createClient(__dirname + '/wsdl/' + file, {strict: true}, function (err, client) {
          client.describe();
          cb(err);
        });
      }, done);
    });
  });


  describe('wsdl parsing test cases', function () {

    it('document/encoded style wsdl is not a supported type', function (done) {
      soap.createClient(__dirname+'/wsdl/unsupported/ImportSample.wsdl', function(err, client) {
        var expectedError = false;
        try {
          client.describe();
        } catch (err) {
          //Error is expected in this negative test where ImportSample.wsdl is an invalid wsdl since it uses
          //document/encode style. Code throws "WSDL not supported DocumentEncode Style" error.
          expectedError = true;
        }
        assert.ok(expectedError);
        done();
      });
    });

    it('should not parse connection error', function (done) {
      soap.createClient(__dirname+'/wsdl/connection/econnrefused.wsdl', function(err, client) {
        assert.ok(/EADDRNOTAVAIL|ECONNREFUSED/.test(err), err);
        done();
      });
    });

    it('should catch parse error', function (done) {
      soap.createClient(__dirname+'/wsdl/bad.txt', function(err) {
        assert.notEqual(err, null);
        done();
      });
    });


    it('should parse external wsdl', function (done) {
      soap.createClient(__dirname+'/wsdl/wsdlImport/main.wsdl', {strict: true}, function(err, client){
        assert.ok(!err);
        assert.deepEqual(Object.keys(client.wsdl.definitions.schemas),
          ['http://example.com/', 'http://schemas.microsoft.com/2003/10/Serialization/Arrays']);
        assert.equal(typeof client.getLatestVersion, 'function');
        done();
      });
    });

    it('should get the parent namespace when parent namespace is empty string', function (done) {
      soap.createClient(__dirname+'/wsdl/marketo.wsdl', {strict: true}, function(err, client){
        assert.ok(!err);
        client.getLeadChanges({
          batchSize: 1,
          startPosition: {activityCreatedAt: '2014-04-14T22:03:48.587Z'},
          activityNameFilter: {stringItem: ['Send Email']}
        }, function() {
          done();
        });
      });
    });

    it('should handle element ref', function (done) {
      var expectedMsg = '<soap:Body>\n  '+
        '<ns2:fooRq xmlns:ns2=\"http://example.com/bar/xsd\">\n    '+
          '<ns3:paymentRq xmlns:ns3=\"http://example.com/bar1/xsd\">\n      '+
          '<ns3:bankSvcRq>\n        '+
          '<ns3:requestUID>001</ns3:requestUID>\n      '+
          '</ns3:bankSvcRq>\n    '+
          '</ns3:paymentRq>\n  '+
        '</ns2:fooRq>\n</soap:Body>\n';
      soap.createClient(__dirname + '/wsdl/elementref/foo.wsdl', {strict: true}, function(err, client) {
        assert.ok(!err);
        client.fooOp({fooRq: {paymentRq: {bankSvcRq: {requestUID: '001'}}}}, function(err, result) {
          assert.equal(client.lastMessage, expectedMsg);
          done();
        });
      });
    });

    it('should handle type ref', function (done) {
      var expectedMsg = require('./wsdl/typeref/request.xml.js');
      var reqJson = require('./wsdl/typeref/request.json');
      soap.createClient(__dirname + '/wsdl/typeref/order.wsdl', {strict: true}, function(err, client) {
        assert.ok(!err);
        client.order(reqJson, function(err, result) {
          assert.equal(client.lastMessage, expectedMsg);
          done();
        });
      });
    });

    it('should get empty namespace prefix', function (done) {
      var expectedMsg = '<soap:Body>\n  '+
        '<ns2:fooRq xmlns:ns2=\"http://example.com/bar/xsd\">\n    '+
          '<ns3:paymentRq xmlns:ns3=\"http://example.com/bar1/xsd\">\n      '+
          '<ns3:bankSvcRq>\n        '+
            '<RequestUID>001</RequestUID>\n      '+
          '</ns3:bankSvcRq>\n    '+
          '</ns3:paymentRq>\n  '+
        '</ns2:fooRq>\n</soap:Body>\n';
      soap.createClient(__dirname + '/wsdl/elementref/foo.wsdl', {strict: true}, function(err, client) {
        assert.ok(!err);
        client.fooOp({fooRq:{paymentRq: {bankSvcRq: {'RequestUID': '001'}}}}, function(err, result) {
          assert.equal(client.lastMessage, expectedMsg);
          done();
        });
      });
    });

    //revisit -  If client class is modified, client.describe() will change.. it's pain to keep changing the 'expected'
    //output. What's the value of this test? Do we need this test? Skipping for now even though test passes currently.
    it.skip('should load same namespace from included xsd', function (done) {
      var expected = {"DummyService":{"DummyPortType":{"Dummy":{"name":"Dummy","style":"documentLiteral","soapAction":"tns#Dummy","soapVersion":"1.1","input":{"body":{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyRequest"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[]},"headers":{"elements":[],"attributes":[]}},"output":{"body":{"elements":[{"elements":[{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"typeDescriptor":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"name":"DummyList","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyResponse"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[]},"headers":{"elements":[],"attributes":[]}},"faults":{"body":{"Fault":{"faults":{}}}},"inputEnvelope":{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyRequest"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"ID"},"type":{"nsURI":"http://www.dummy.com/Types","name":"IdType"},"form":"qualified","isMany":false,"isSimple":true}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Name"},"type":{"nsURI":"http://www.dummy.com/Types","name":"NameType"},"form":"qualified","isMany":false,"isSimple":true}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyRequest"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}}],"attributes":[]},"outputEnvelope":{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"typeDescriptor":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"name":"DummyList","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyResponse"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"Result"},"type":{"nsURI":"http://www.dummy.com/Types","name":"DummyList"},"form":"qualified","isMany":false,"isSimple":false,"typeDescriptor":{"elements":[{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":true,"isSimple":true,"refOriginal":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"qname":{"nsURI":"http://www.dummy.com/Types","name":"dummy"},"type":{"nsURI":"http://www.dummy.com/Types","name":"Dummy"},"form":"qualified","isMany":false,"isSimple":true,"extension":{"name":"string","xmlns":"","isSimple":true},"typeDescriptor":{"elements":[],"attributes":[{"qname":{"nsURI":"http://www.dummy.com/Types","name":"language"},"type":{"nsURI":"http://www.w3.org/2001/XMLSchema","name":"language"},"form":"unqualified"}],"extension":{"name":"string","xmlns":"","isSimple":true},"name":"Dummy","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"name":"DummyList","xmlns":"http://www.dummy.com/Types","isSimple":false}}}],"attributes":[],"qname":{"nsURI":"http://www.dummy.com","name":"DummyResponse"},"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}}],"attributes":[]},"faultEnvelope":{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Fault","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Fault","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Header","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false},{"elements":[{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Fault","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultcode","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultstring","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"faultactor","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}},{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false,"refOriginal":{"elements":[],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"detail","prefix":"soap"},"type":null,"form":"unqualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Fault","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Body","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}],"attributes":[],"qname":{"nsURI":"http://schemas.xmlsoap.org/soap/envelope/","name":"Envelope","prefix":"soap"},"type":null,"form":"qualified","isMany":false,"isSimple":false}}],"attributes":[]}}}}};
      soap.createClient(__dirname + '/wsdl/xsdinclude/xsd_include.wsdl', function(err, client) {
        assert.ok(!err);
        var expectedString = JSON.stringify(expected);
        var result = JSON.stringify(client.describe());
        assert.equal(result, expectedString);
        done();
      });
    });

    it('handles xsd includes', function(done) {
      soap.createClient(__dirname + '/wsdl/xsdinclude/xsd_include.wsdl', function(err, client) {
        assert.ok(!err);
        var schema = client.wsdl.definitions.schemas['http://www.dummy.com/Types'];
        var simpleTypes = Object.keys(schema.simpleTypes);
        simpleTypes.should.eql(['IdType', 'NameType', 'AnotherIdType'])
        done();
      });
    });

    it('should map isMany values correctly', function(done) {
      openWSDL(path.resolve(__dirname, 'wsdl/marketo.wsdl'), function(
        err,
        def
      ) {
        var operation = def.definitions.bindings.MktowsApiSoapBinding.operations.getLeadChanges;
        var operationDesc = operation.describe(def);
        assert(operationDesc.input.body.elements[0].elements);

        // Check that an element with maxOccurs="1" maps to isMany = false
        operationDesc.input.body.elements[0].elements.forEach(function(element){
          if(element.qname.name === 'startPosition'){
            assert.equal(element.isMany, false);
          }

          // Check that an element with maxOccurs="unbounded" maps to isMany = false
          if(element.qname.name === 'activityNameFilter'){
            assert(element.elements[0]);
            assert.equal(element.elements[0].isMany, true);
          }
        });

        done();
      });
    });
  });
});

