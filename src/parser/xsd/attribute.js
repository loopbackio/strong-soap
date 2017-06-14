'use strict';

var XSDElement = require('./xsdElement');
var Schema = require('./schema');
var QName = require('../qname');

class Attribute extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  getForm() {
    var parent = this.parent;
    if (parent instanceof Schema) {
      // Global attribute
      return 'qualified';
    }
    if (this.$form) {
      return this.$form;
    }
    while (parent) {
      if (parent instanceof Schema) {
        return parent.$attributeFormDefault || 'unqualified';
      }
      parent = parent.parent;
    }
    return 'unqualified';
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;

    if (this.ref) {
      // Ref to a global attribute
      this.descriptor = this.ref.describe(definitions);
      this.descriptor.form = 'qualified';
    } else {
      var form = this.getForm();
      var qname = this.getQName();
      var isMany = this.isMany();
      var type = this.type;
      var typeQName;
      if (type instanceof QName) {
        typeQName = type;
      } else if (type instanceof XSDElement) {
        typeQName = type.getQName();
      }
      this.descriptor =
        new XSDElement.AttributeDescriptor(qname, typeQName, form, isMany);
    }
    return this.descriptor;

  }

  postProcess(defintions) {
    var schemas = defintions.schemas;
    if (this.$ref) {
      this.ref = this.resolveSchemaObject(schemas, 'attribute', this.$ref);
    } else if (this.$type) {
      this.type = this.resolveSchemaObject(schemas, 'type', this.$type);
    }
  }
}

Attribute.elementName = 'attribute';
Attribute.allowedChildren = ['annotation', 'simpleType'];

module.exports = Attribute;
