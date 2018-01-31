'use strict';

describe('CookieSecurity', function() {
  var CookieSecurity = require('../../').CookieSecurity;
  var cookie = 'cookie-value';
  var headers = {
    'set-cookie': [
      cookie
    ]
  };

  it('is a function', function() {
    CookieSecurity.should.be.type('function');
  });

  describe('cookie value', function () {
    var instance1 = new CookieSecurity(cookie);
    var instance2 = new CookieSecurity(headers);

    it('is accepted with cookie string', function () {
      instance1.should.have.property('cookie', cookie);
    });

    it('is accepted with last header', function () {
      instance2.should.have.property('cookie', cookie);
    });
  });

  describe('defaultOption param', function() {
    it('is accepted as the second param', function() {
      new CookieSecurity(cookie, {});
    });

    it('is used in addOptions', function() {
      var options = {};
      var defaultOptions = { foo: 2 };
      var instance = new CookieSecurity(cookie, defaultOptions);
      instance.addOptions(options);
      options.should.have.property('foo', 2);
    });
  });
});
