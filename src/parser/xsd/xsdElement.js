'use strict';

var Element = require('../element');
var helper = require('../helper');
var descriptor = require('./descriptor');

class XSDElement extends Element {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  describeChildren(definitions, descriptor) {
    var children = this.children || [];
    if (children.length === 0) return descriptor;
    descriptor = descriptor || new XSDElement.TypeDescriptor();

    var isMany = this.isMany();
    var childDescriptor;
    for (var i = 0, child; child = children[i]; i++) {
      childDescriptor = child.describe(definitions);
      if (childDescriptor) {
        descriptor.add(childDescriptor, isMany);
      }
    }
    return descriptor;
  }

  describe(definitions) {
    return this.describeChildren(definitions);
  }

  postProcess(definitions) {
    // NO-OP
  }

  /**
   * Check if the max occurrence is many
   * @returns {boolean}
   */
  isMany() {
    if (this.$maxOccurs === 'unbounded') return true;
    return Number(this.$maxOccurs) > 1;
  }
}

XSDElement.targetNamespace = Element.namespaces.xsd;
XSDElement.allowedChildren = ['annotation'];

// Descriptors
XSDElement.ElementDescriptor = descriptor.ElementDescriptor;
XSDElement.AttributeDescriptor = descriptor.AttributeDescriptor;
XSDElement.TypeDescriptor = descriptor.TypeDescriptor;

module.exports = XSDElement;

