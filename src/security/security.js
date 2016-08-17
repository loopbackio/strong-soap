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
