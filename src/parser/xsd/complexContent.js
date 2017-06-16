'use strict';

var XSDElement = require('./xsdElement');
var Extension = require('./extension');

class ComplexContent extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = this.descriptor =
      new XSDElement.TypeDescriptor();
    var children = this.children || [];
    var childDescriptor;
    for (var i = 0, child; child = children[i]; i++) {
      childDescriptor = child.describe(definitions);
      if (childDescriptor) {
        descriptor.add(childDescriptor);
      }
    }
    return descriptor;
  }
}

ComplexContent.elementName = 'complexContent';
ComplexContent.allowedChildren = ['annotation', 'extension', 'restriction'];

module.exports = ComplexContent;
