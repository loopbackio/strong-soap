'use strict';

var Element = require('../element');

class WSDLElement extends Element {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

WSDLElement.targetNamespace = Element.namespaces.wsdl;
WSDLElement.allowedChildren = ['documentation'];

module.exports = WSDLElement;
