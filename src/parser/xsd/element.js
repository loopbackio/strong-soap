// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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

    var type = this.type;
    var typeQName;
    if (type instanceof QName) {
      typeQName = type;
    } else if (type instanceof XSDElement) {
      typeQName = type.getQName();
    }
    var descriptor = this.descriptor =
      new XSDElement.ElementDescriptor(qname, typeQName, form, isMany);

    if (this.$nillable) {
      descriptor.isNillable = true;
    }

    if (this.ref) {
      // Ref to a global element
      var refDescriptor = this.ref.describe(definitions);
      if (refDescriptor) {
        this.descriptor = descriptor = refDescriptor.clone(isMany);
        if (this.$nillable) {
          descriptor.isNillable = true;
        }
      }
    } else if (this.type) {
      if (this.type instanceof ComplexType) {
        descriptor.isSimple = false;
        var typeDescriptor = this.type.describe(definitions);
        if (typeDescriptor) {
          descriptor.elements = typeDescriptor.elements;
          descriptor.attributes = typeDescriptor.attributes;
          descriptor.mixed = typeDescriptor.mixed;
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
            descriptor.mixed = childDescriptor.mixed;
          }
          break;
        } else if (child instanceof SimpleType) {
          // name of the parent element is the anonymous type's name
          child.$name = this.$name;
          let typeQName = child.getQName();
          // regenerate descriptor with new type qname
          descriptor = this.descriptor =
            new XSDElement.ElementDescriptor(qname, typeQName, form, isMany);
          descriptor.isSimple = true;
          if (child.type && child.type.jsType) {
            descriptor.jsType = child.type.jsType;
          } else if (child.jsType) {
            descriptor.jsType = child.jsType;
          }
          descriptor.type = typeQName;
          // embed anonymous type inside the descriptor
          descriptor.type.anonymous = child;
        }
      }
    }
    return descriptor;
  }

  postProcess(defintions) {
    var schemas = defintions.schemas;
    if (this.$ref) {
      this.ref = this.resolveSchemaObject(schemas, 'element', this.$ref);
    } else if (this.$type) {
      this.type = this.resolveSchemaObject(schemas, 'type', this.$type);
    }
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
