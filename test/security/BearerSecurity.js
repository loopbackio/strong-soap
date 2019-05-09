// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

describe('BearerSecurity', function() {
  var BearerSecurity = require('../../').BearerSecurity;
  var token = "token";

  it('is a function', function() {
    BearerSecurity.should.be.type('function');
  });

  describe('defaultOption param', function() {
    it('is accepted as the second param', function() {
      new BearerSecurity(token, {});
    });

    it('is used in addOptions', function() {
      var options = {};
      var defaultOptions = { foo: 2 };
      var instance = new BearerSecurity(token, defaultOptions);
      instance.addOptions(options);
      options.should.have.property("foo", 2);
    });
  });
});
