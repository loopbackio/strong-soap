'use strict';

var WSDLElement = require('./wsdlElement');

class Import extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.schemas = {};
  }
}

Import.elementName = 'import';

module.exports = Import;
