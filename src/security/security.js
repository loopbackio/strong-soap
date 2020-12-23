// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');

/**
 * Base class for Web Services Security
 */
class Security {
  constructor(options) {
    this.options = options || {};
  }

  addOptions(options) {
    _.merge(options, this.options);
  };

  addHttpHeaders(headers) {
  }

  addSoapHeaders(headerElement) {
  }

  postProcess(envelopeElement, headerElement, bodyElement) {
  }
}

module.exports = Security;
