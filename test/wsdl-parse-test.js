'use strict';

var path = require('path');
var openWSDL = require('..').WSDL.open;
var assert = require('assert');




describe(__filename, function() {
  it('should parse recursive elements', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive.wsdl'),
      function(err, def) {
        var part = def.definitions.messages.operationRequest.parts.params;
        assert(part.element);
        assert.equal(part.element.$name, 'operationRequest');
        assert.equal(part.element.$type, 'tns:OperationRequest');
        done();
      });
  });

  it('should parse recursive wsdls', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive/file.wsdl'),
      function(err, def) {
        // If we get here then we succeeded
        done(err);
      });
  });

  it('should parse recursive wsdls keeping default options', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/recursive/file.wsdl'),
      function(err, def) {
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
    openWSDL(path.resolve(__dirname, 'wsdl/recursive/file.wsdl'), {
      ignoredNamespaces: {
        namespaces: ['targetNamespace', 'typedNamespace'],
        override: true
      }
    }, function(err, def) {
      if (err) {
        return done(err);
      }

      def._includesWsdl.forEach(function(currentWsdl, index) {
        assert.deepEqual(def.options, currentWsdl.options);
      });

      done();
    });
  });

  it('should parse types with same or no target namespaces', function(done) {
    openWSDL(path.resolve(__dirname, 'wsdl/types-with-schemas/wsdl_service.wsdl'),
      function(err, def) {
        var schemas = def.definitions.schemas;
        assert.deepEqual(Object.keys(schemas), [ 'undefined',
        'http://company.de/cake/synonymelisten/webservice',
        'http://company.de/cake/synonymelisten',
        'http://company.de/cake/synonymelisten/webservice/exceptions' ]);
        done();
      });
  });
});
