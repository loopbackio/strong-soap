var WSDLElement = require('./wsdlElement');
var assert = require('assert');
var Schema = require('../xsd/schema');

class Types extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.schemas = {};
  }

  addChild(child) {
    assert(child instanceof Schema);

    var targetNamespace = child.$targetNamespace;

    if (!this.schemas.hasOwnProperty(targetNamespace)) {
      this.schemas[targetNamespace] = child;
    } else {
      console.error('Target namespace "' + targetNamespace +
        '" already in use by another Schema');
    }
  };
}

Types.elementName = 'types';
Types.allowedChildren = ['schema', 'documentation'];

module.exports = Types;
