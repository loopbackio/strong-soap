'use strict';

var g = require('../../globalize');
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
      g.error('Target namespace "%s" already in use by another Schema',
        targetNamespace);
    }
  };
}

Types.elementName = 'types';
Types.allowedChildren = ['schema', 'documentation'];

module.exports = Types;
