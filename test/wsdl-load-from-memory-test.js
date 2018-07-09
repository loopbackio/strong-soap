"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    WSDL = soap.WSDL,
    assert = require('assert'),
    path = require('path');

describe('wsdl-load-from-memory-tests', function() {

  describe('should load the wsdl from memory', function () {

    var stockQuoteWsdlContents

    beforeEach(function (done) {

      // Read the contents of the WSDL from the file system
      fs.readFile(__dirname + '/wsdl/from-memory/stockquote.wsdl', 'utf8', function (err, definition) {
      if (err) {
        done(err)
      } else {
        stockQuoteWsdlContents = definition;
        done()
      }
      });
    });

    it('should load a wsdl with no imports directly from memory', function (done) {

      var options = {
        WSDL_CACHE: {}
      }
      // Create the initial wsdl directly
      var stockQuoteWsdl = new WSDL(stockQuoteWsdlContents, undefined, options)

      // Load the wsdl fully once its been created in memory
      stockQuoteWsdl.load(function () {
        assert.equal(stockQuoteWsdl.definitions['$name'], "StockQuote")
        done()
      })
    });
  });

  describe('should load a multipart wsdl from the cache', function () {

    var options = {
      WSDL_CACHE: {}
    }

    beforeEach(function (done) {
      var filePrefix = __dirname + '/wsdl/from-memory/multipart/';
      var promiseList = []
      /**
       * Read the contents of each of the files from the multipart directory
       */
      fs.readdirSync(filePrefix).forEach(function (fileName) {
        promiseList.push(new Promise(function (resolve, reject) {
          fs.readFile(filePrefix + fileName, 'utf8', function (err, definition) {
            if (err) {
              reject(err)
            } else {
              /**
               * Create a WSDL object for each of the files and store them
               * in options.WSDL_CACHE. Don't call load() at this point.
               */

              // This path name isn't the correct one, however it is what the strong-soap
              // implementation will default to when it comes to checking the cache.
              var includePath = path.resolve(fileName)
              var wsdl = new WSDL(definition, includePath, options)
              options.WSDL_CACHE[includePath] = wsdl
              wsdl.WSDL_CACHE = options.WSDL_CACHE
              resolve(wsdl)
            }
          })
        }))
      });
      Promise.all(promiseList).then(function (values) {
        done();
      })

    });

    it('a multipart wsdl should load from the cache with no errors', function(done){
      /**
       * Read in a file wsdl file containing a definition. For the purpose of this test this file should be one that is
       * in the WSDL_CACHE already, but loaded from a different location. The reason for the different location is that
       * the this will show that the additional wsdls and xsd files are being read from the cache and not just from the
       * relative path on the file system.
       */
       fs.readFile(__dirname + '/wsdl/from-memory/main.wsdl', 'utf8', function (err, definition) {

         assert.ok(!err);
         /**
          * Load the starting point wsdl from memory. Put in an incorrect uri as this should be loaded from the CACHE
          */
         var wsdlDefinition = new WSDL(definition, 'startingWsdlUri', options)

         /**
          * The load() function should take into account wsdls which have had their definitions loaded into the WSDL_CACHE,
          * but still needs to be fully parsed and loaded.
          */
         wsdlDefinition.load(function (err, loadedWsdl) {
           assert.ok(!err);
           assert(loadedWsdl);
           assert(loadedWsdl.definitions);
           assert.notDeepEqual(loadedWsdl.definitions.bindings, {}, "Bindings not loaded on wsdl");
           assert.notDeepEqual(loadedWsdl.definitions.services, {}, "Services not loaded on wsdl");
           assert.notDeepEqual(loadedWsdl.definitions.portTypes, {}, "PortTypes not loaded on wsdl");
           done();
         })
      })
    })
  });
});

