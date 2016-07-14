'use strict';

var _ = require('lodash');
var Security = require('./security');

class BearerSecurity extends Security {
  constructor(token, options) {
    super(options);
    this.token = token;
  }

  addHttpHeaders(headers) {
    headers.Authorization = "Bearer " + this.token;
  }
}

module.exports = BearerSecurity;
