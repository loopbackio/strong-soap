'use strict';

var XSDElement = require('./xsdElement');

class Include extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}


Include.elementName = 'include';

module.exports = Include;
