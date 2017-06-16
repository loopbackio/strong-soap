'use strict';

var XSDElement = require('./xsdElement');

class Any extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Any.elementName = 'any';

module.exports = Any;
