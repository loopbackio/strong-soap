// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');

class AttributeGroup extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
  
  resolve(schemas) {
    if (this.$ref) {
      this.ref = this.resolveSchemaObject(schemas, 'attributeGroup', this.$ref);
    }
  }

  describe(definitions) {
    if (!this.ref && this.$ref) {
      this.resolve(definitions.schemas);
    }
    if (this.descriptor) return this.descriptor;
    if (this.ref) {
      this.descriptor = this.ref.describe(definitions);
    } else {
      this.descriptor = this.describeChildren(definitions);
    }
    return this.descriptor;
  }
}

AttributeGroup.elementName = 'attributeGroup';
AttributeGroup.allowedChildren = ['annotation', 'attribute', 'attributeGroup',
  'anyAttribute'];

module.exports = AttributeGroup;
