'use strict';

var _ = require('lodash');
var Security = require('./security');

class BasicAuthSecurity extends Security {
  constructor(username, password, options) {
    super(options);
    this.username = username;
    this.password = password;
  }

  addHttpHeaders(headers) {
    var cred = new Buffer((this.username + ':' + this.password) || '')
      .toString('base64');
    headers.Authorization = 'Basic ' + cred;
  };
}

module.exports = BasicAuthSecurity;
