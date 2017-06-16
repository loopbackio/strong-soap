'use strict';

var WSDLElement = require('./wsdlElement');

class Part extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
  
  postProcess(definitions) {
    if (this.$element) {
      this.element = this.resolveSchemaObject(
        definitions.schemas, 'element', this.$element);
    } else if (this.$type) {
      this.type = this.resolveSchemaObject(
        definitions.schemas, 'type', this.$type);
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    if (this.element) {
      this.descriptor = this.element.describe(definitions);
    } else if (this.type) {
      this.descriptor = this.type.describe(definitions);
    } else {
      this.descriptor = null;
    }
    return this.descriptor;
  }
}

Part.elementName = 'part';

module.exports = Part;
