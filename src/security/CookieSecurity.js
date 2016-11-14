'use strict';

var Security = require('./security');

class CookieSecurity extends Security {
  constructor(cookie, options) {
    super(options);
    this.cookie = cookie;
  }

  addHttpHeaders(headers) {
    headers.Cookie = this.cookie;
  }
}

module.exports = CookieSecurity;
