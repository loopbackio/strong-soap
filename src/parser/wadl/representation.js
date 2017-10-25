'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');

var Part = require('../wsdl/part');

class Representation extends Part {

  postProcess(definitions) {
    if (this.$element) {
      this.element = (
        this.resolveSchemaObject(definitions.schemas, 'element', this.$element)
        || this.resolveSchemaObject(definitions.schemas, 'type', this.$element)
      );
    } else if (this.$type) {
      this.type = this.resolveSchemaObject(
        definitions.schemas, 'type', this.$type);
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = {
      id: this.$id,
      mediaType: this.$mediaType,
      element: null,
    };
    if (this.element) {
      descriptor.element = this.element.describe(definitions);
    } else if (this.type) {
      descriptor.element = this.type.describe(definitions);
    }
    this.descriptor = descriptor;
    return this.descriptor;
  }
}

Representation.elementName = 'representation';
Representation.targetNamespace = "http://wadl.dev.java.net/2009/02";
Representation.allowedChildren = ['documentation'];

module.exports = Representation;
