'use strict';

var XSDElement = require('./xsdElement');

class AnyAttribute extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

AnyAttribute.elementName = 'anyAttribute';

module.exports = AnyAttribute;
