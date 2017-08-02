'use strict';

var XSDElement = require('./xsdElement');
var QName = require('../qname');
var helper = require('../helper');
var Schema = require('./schema');
var ComplexType = require('./complexType');
var SimpleType = require('./simpleType');

class Element extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  addChild(child) {
    this[child.name] = child;
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var form = this.getForm();
    var qname = this.getQName();
    var isMany = this.isMany();

    // Because of recursive import/includes, this is a better place to look up the types.
    var schemas = definitions.schemas;
    if (this.$ref) {
      this.ref = this.resolveSchemaObject(schemas, 'element', this.$ref);
    } else if (this.$type) {
      this.type = this.resolveSchemaObject(schemas, 'type', this.$type);
    }
    var type = this.type;
    var typeQName;
    if (type instanceof QName) {
      typeQName = type;
    } else if (type instanceof XSDElement) {
      typeQName = type.getQName();
    }
    var descriptor = this.descriptor =
      new XSDElement.ElementDescriptor(qname, typeQName, form, isMany);

    if (this.$nillable === true || this.$nillable === "true") {
      descriptor.isNillable = true;
    }

    if (this.ref) {
      // Ref to a global element
      var refDescriptor = this.ref.describe(definitions);
      if (refDescriptor) {
        this.descriptor = descriptor = refDescriptor.clone(isMany);
      }
    } else if (this.type) {
      if (this.type instanceof ComplexType) {
        descriptor.isSimple = false;
        var typeDescriptor = this.type.describe(definitions);
        if (typeDescriptor) {
          descriptor.elements = typeDescriptor.elements;
          descriptor.attributes = typeDescriptor.attributes;
          definitions.mixed = typeDescriptor.mixed;
          descriptor.extension = typeDescriptor.extension;
          if(descriptor.extension && descriptor.extension.isSimple === true) {
            descriptor.isSimple = true;
          }
          descriptor.typeDescriptor = typeDescriptor;
        }
      } else if (this.type instanceof SimpleType) {
        descriptor.isSimple = true;
        descriptor.jsType = this.type.jsType;
      }
    } else {
      // anonymous complexType or simpleType
      var children = this.children;
      for (var i = 0, child; child = children[i]; i++) {
        if (child instanceof ComplexType) {
          descriptor.isSimple = false;
          var childDescriptor = child.describe(definitions);
          if (childDescriptor) {
            descriptor.elements = childDescriptor.elements;
            descriptor.attributes = childDescriptor.attributes;
            definitions.mixed = childDescriptor.mixed;
          }
          break;
        } else if (child instanceof SimpleType) {
          descriptor.isSimple = true;
          descriptor.jsType = child.jsType;
        }
      }
    }
    return descriptor;
  }

  postProcess(defintions) {
    // Because of recursive import/includes, this is not a good place to process types. In some
    // cases the type lookup will fail because it has not been added to the schemas.
    if (this.substitutionGroup) {
      this.substitutionGroup = this.resolveSchemaObject(
        schemas, 'element', this.$substitutionGroup);
    }
  }

  getForm() {
    var parent = this.parent;
    if (parent instanceof Schema) {
      // Global element
      return 'qualified';
    }
    if (this.$form) {
      return this.$form;
    }
    while (parent) {
      if (parent instanceof Schema) {
        return parent.$elementFormDefault || 'unqualified';
      }
      parent = parent.parent;
    }
    return 'unqualified';
  }
}

Element.elementName = 'element';
Element.allowedChildren = ['annotation', 'complexType', 'simpleType',
  'unique', 'key', 'keyref'];

module.exports = Element;
