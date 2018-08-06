'use strict';

var WSDLElement = require('./wsdlElement');
var assert = require('assert');
var Schema = require('../xsd/schema');
var Documentation = require('./documentation');

class Types extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.schemas = {};
  }

  addChild(child) {
    assert(child instanceof Schema || child instanceof Documentation);

    if (child instanceof Schema) {

      var targetNamespace = child.$targetNamespace;

      if (!this.schemas.hasOwnProperty(targetNamespace)) {
        this.schemas[targetNamespace] = child;
      } else {
        // types might have multiple schemas with the same target namespace,
        // including no target namespace
        this.schemas[targetNamespace].merge(child, true);
      }
    }
  };
}

Types.elementName = 'types';
Types.allowedChildren = ['schema', 'documentation'];

module.exports = Types;
