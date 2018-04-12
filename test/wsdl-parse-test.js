'use strict';

var path = require('path');
var openWSDL = require('..').WSDL.open;
var assert = require('assert');

describe(__filename, function() {
  it('should parse recursive elements', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive.wsdl'), function(
      err,
      def
    ) {
      var part = def.definitions.messages.operationRequest.parts.params;
      assert(part.element);
      assert.equal(part.element.$name, 'operationRequest');
      assert.equal(part.element.$type, 'tns:OperationRequest');
      done();
    });
  });

  it('should parse recursive wsdls', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive/file.wsdl'), function(
      err,
      def
    ) {
      var schema = def.definitions.schemas['http://www.Dummy.com/Common/Types'];
      var complexType = schema.complexTypes['ContactMedium'];
      var doc = complexType.children[0].children[0];
      assert.equal(doc.name, 'documentation');
      assert.equal(doc.$value, 'Defines the method of contact to reach a ' +
        'party (in\n                their specified role)');
      // If we get here then we succeeded
      done(err);
    });
  });

  it('should parse recursive wsdls keeping default options', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive/file.wsdl'), function(
      err,
      def
    ) {
      if (err) {
        return done(err);
      }

      def._includesWsdl.forEach(function(currentWsdl) {
        assert.deepEqual(def.options, currentWsdl.options);
      });

      done();
    });
  });

  it('should parse recursive wsdls keeping provided options', function(done) {
    openWSDL(
      path.resolve(__dirname, 'wsdl/recursive/file.wsdl'),
      {
        ignoredNamespaces: {
          namespaces: ['targetNamespace', 'typedNamespace'],
          override: true
        }
      },
      function(err, def) {
        if (err) {
          return done(err);
        }

        def._includesWsdl.forEach(function(currentWsdl, index) {
          assert.deepEqual(def.options, currentWsdl.options);
        });

        done();
      }
    );
  });

  it('should parse types with same or no target namespaces', function(done) {
    openWSDL(
      path.resolve(__dirname, 'wsdl/types-with-schemas/wsdl_service.wsdl'),
      function(err, def) {
        var schemas = def.definitions.schemas;
        assert.deepEqual(Object.keys(schemas), [
          'undefined',
          'http://company.de/cake/synonymelisten/webservice',
          'http://company.de/cake/synonymelisten',
          'http://company.de/cake/synonymelisten/webservice/exceptions'
        ]);
        done();
      }
    );
  });

  it('should parse types with recursive imports', function(done) {
    openWSDL(
      path.resolve(
        __dirname,
        'wsdl/recursive-schema-import/TestFunctionManagement.wsdl'
      ),
      function(err, def) {
        var schemas = def.definitions.schemas;
        assert.deepEqual(Object.keys(schemas), [
          'http://www.example.com/Schema/TEST_TestFunctionManagement',
          'http://www.example.com/Schema/TEST_Common',
          'http://www.example.com/Schema/TEST',
          'http://www.example.com/Schema/Infrastructure/SOAP',
          'http://www.example.com/Schema/Infrastructure',
          'http://www.example.com/Schema/TEST_AccountingUnit',
          'http://www.example.com/Schema/TEST_Location',
          'http://www.example.com/Schema/TEST_TestFunction',
          'http://www.example.com/Schema/TEST_BusinessDirectionItem',
          'http://www.example.com/Schema/TEST_ResourceItem',
          'http://www.example.com/Schema/TEST_Channel',
          'http://www.example.com/Schema/TEST_Product',
          'http://www.example.com/Schema/TEST_Event',
          'http://www.example.com/Schema/TEST_Arrangement',
          'http://www.example.com/Schema/TEST_Authorization',
          'http://www.example.com/Schema/TEST_Communication',
          'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd'
        ]);
        done();
      }
    );
  });
});
