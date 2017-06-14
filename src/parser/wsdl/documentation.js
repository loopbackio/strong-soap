'use strict';

var WSDLElement = require('./wsdlElement');

class Documentation extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Documentation.elementName = 'documentation';
Documentation.allowedChildren = [];

module.exports = Documentation;
