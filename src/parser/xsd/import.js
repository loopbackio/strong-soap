'use strict';

var XSDElement = require('./xsdElement');

class Import extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Import.elementName = 'import';

module.exports = Import;
