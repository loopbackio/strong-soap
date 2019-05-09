// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
    var cred = Buffer.from((this.username + ':' + this.password) || '')
      .toString('base64');
    headers.Authorization = 'Basic ' + cred;
  };
}

module.exports = BasicAuthSecurity;
