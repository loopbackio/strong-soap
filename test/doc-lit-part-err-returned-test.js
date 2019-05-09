// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";

var fs = require('fs'),
    soap = require('..').soap,
    WSDL = soap.WSDL,
    assert = require('assert'),
    path = require('path');

describe('doc-lit-part-err-returned-tests', function() {

  it('Loading wsdl should return an error via the callback', function (done) {
    WSDL.open(path.resolve(__dirname, 'wsdl/doc-lit-part-error/sample.wsdl'),function (err) {
      if(err){
       // check error thrown
        assert.equal(err.message, 'Document/literal part should use element');
        done();
      } else {
        done('Expepected "Document/literal part should use element" error to be thrown');
      }
    });
  });
});

