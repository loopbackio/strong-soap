"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    WSDL = soap.WSDL,
    assert = require('assert'),
    path = require('path');

describe('wsdl-load-from-memory-tests', function() {

  describe('should load the wsdl from memory', function () {

    var stockQuoteWsdlContents;
    var mainWsdlContents;

    beforeEach(function (done) {

      var promiseList = [];

      promiseList.push(new Promise(function (resolve, reject) {
        fs.readFile(__dirname + '/wsdl/from-memory/stockquote.wsdl', 'utf8', function (err, definition) {
          if (err) {
            reject(err);
          } else {
            stockQuoteWsdlContents = definition;
            resolve(stockQuoteWsdlContents);
          }
        })
      }));

      promiseList.push(new Promise(function (resolve, reject) {
        fs.readFile(__dirname + '/wsdl/from-memory/main.wsdl', 'utf8', function (err, definition) {
          if (err) {
            reject(err)
          } else {
            mainWsdlContents = definition;
            resolve(mainWsdlContents)
          }
        })
      }));

      Promise.all(promiseList).then(function () {
        done();
      })


    });

    it('should load a wsdl with no imports directly from memory', function (done) {

      var options = {
        WSDL_CACHE: {}
      }
      // Create the initial wsdl directly
      var stockQuoteWsdl = new WSDL(stockQuoteWsdlContents, undefined, options)

      // Load the wsdl fully once its been created in memory
      stockQuoteWsdl.load(function () {
        assert.equal(stockQuoteWsdl.definitions['$name'], "StockQuote");
        done();
      })
    });

    it('should load a wsdl synchronously with no imports directly from memory or should honour synchronous loading of a wsdl', function (done) {

      var options = {
        WSDL_CACHE: {}
      };
      // Create the initial wsdl directly
      var stockQuoteWsdl = new WSDL(stockQuoteWsdlContents, undefined, options);

      // Load the wsdl fully once its been created in memory in a sync manner
      var checkwsdl = stockQuoteWsdl.loadSync();
      assert.equal(checkwsdl.definitions['$name'], "StockQuote");
      done();
    });

    it('should fail to load a wsdl synchronously as wsdl not present in memory', function (done) {

      var options = {
        WSDL_CACHE: {}
      };
      // Create the initial wsdl directly
      var mainWsdl = new WSDL(mainWsdlContents, undefined, options);

      // Load the wsdl fully once its been created in memory in a sync manner which will fail as there
      // are unresolved imports which would need I/O to resolve
      try {
        var checkwsdl = mainWsdl.loadSync();
      } catch(err) {
        console.log(err)
        // check error thrown
        assert.ok(err.indexOf('For loadSync() calls all schemas must be preloaded into the cache') > -1 );
        done();
      }
    });
  });

  describe('should load a multipart wsdl from the cache', function () {

    var options = {
      WSDL_CACHE: {}
    }

    beforeEach(function (done) {
      var filePrefix = __dirname + '/wsdl/from-memory/multipart/';
      var promiseList = [];
      /**
       * Read the contents of each of the files from the multipart directory
       */
      fs.readdirSync(filePrefix).forEach(function (fileName) {
        promiseList.push(new Promise(function (resolve, reject) {
          fs.readFile(filePrefix + fileName, 'utf8', function (err, definition) {
            if (err) {
              reject(err);
            } else {
              /**
               * Create a WSDL object for each of the files and store them
               * in options.WSDL_CACHE. Don't call load() at this point.
               */

              // This path name isn't the correct one, however it is what the strong-soap
              // implementation will default to when it comes to checking the cache.
              var includePath = path.resolve(fileName);
              var wsdl = new WSDL(definition, includePath, options);
              options.WSDL_CACHE[includePath] = wsdl;
              wsdl.WSDL_CACHE = options.WSDL_CACHE;
              resolve(wsdl);
            }
          })
        }))
      });
      Promise.all(promiseList).then(function () {
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
         var wsdlDefinition = new WSDL(definition, 'startingWsdlUri', options);

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


    it('a multipart wsdl should load from the cache in a sync way with no errors', function(done){
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
        var wsdlDefinition = new WSDL(definition, 'startingWsdlUri', options);

        /**
         * The load() function should take into account wsdls which have had their definitions loaded into the WSDL_CACHE,
         * but still needs to be fully parsed and loaded.
         */
        var loadedWsdl = wsdlDefinition.loadSync();
        assert(loadedWsdl);
        assert(loadedWsdl.definitions);
        assert.notDeepEqual(loadedWsdl.definitions.bindings, {}, "Bindings not loaded on wsdl");
        assert.notDeepEqual(loadedWsdl.definitions.services, {}, "Services not loaded on wsdl");
        assert.notDeepEqual(loadedWsdl.definitions.portTypes, {}, "PortTypes not loaded on wsdl");
        done();
      })
    })

  });
});

