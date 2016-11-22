'use strict';

var _ = require('lodash');
var Security = require('./security');

/*
 * Accepts either a cookie or lastResponseHeaders
 */
class CookieSecurity extends Security {
  constructor(cookie, options) {
    super(options);

    cookie = _.get(cookie, 'set-cookie', cookie)
    var cookies = _.map(_.isArray(cookie) ? cookie : [cookie], function (c) {
      return c.split(';')[0];
    })

    this.cookie = cookies.join('; ');
  }

  addHttpHeaders(headers) {
    headers.Cookie = this.cookie;
  }
}

module.exports = CookieSecurity;
