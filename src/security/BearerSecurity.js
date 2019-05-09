// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
