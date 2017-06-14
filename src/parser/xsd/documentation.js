'use strict';

var XSDElement = require('./xsdElement');

class Documentation extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Documentation.elementName = 'documentation';
Documentation.allowedChildren = ['any'];

module.exports = Documentation;
