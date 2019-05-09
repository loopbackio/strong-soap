// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');
var Choice = require('./choice');
var Sequence = require('./sequence');
var All = require('./all');
var SimpleContent = require('./simpleContent');
var ComplexContent = require('./complexContent');

class ComplexType extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = this.descriptor =
      new XSDElement.TypeDescriptor();
    if (this.$mixed) {
      descriptor.mixed = true;
    }
    var children = this.children || [];
    var childDescriptor;
    for (var i = 0, child; child = children[i]; i++) {
      childDescriptor = child.describe(definitions);
      if (childDescriptor) {
        descriptor.add(childDescriptor);
      }
    }
    descriptor.name = this.$name || this.name;
    descriptor.xmlns = this.targetNamespace;
    descriptor.isSimple = false;
    return descriptor;
  }

  describeChildren(definitions) {
    if (this.descriptor) {
      if (this.descriptor.extension) {
        let extension = this.descriptor.extension;
        let xmlns = extension.xmlns;
        let name = extension.name;
        if (xmlns) {
          let schemas = definitions.schemas;
          if (schemas) {
            let schema = schemas[xmlns];
            if (schema) {
              let complexTypes = schema.complexTypes;
              if (complexTypes) {
                let type = complexTypes[name];
                if (type) {
                  if (type.descriptor) {
                    if(!type.descriptor.inheritance){
                      type.descriptor.inheritance = {};
                    }
                    type.descriptor.inheritance[this.descriptor.name] = this.descriptor;
                  }
                }
              }
            }
          }
        }
      }  
    }
  }
}

ComplexType.elementName = 'complexType';
ComplexType.allowedChildren = ['annotation', 'group', 'sequence', 'all',
  'complexContent', 'simpleContent', 'choice', 'attribute', 'attributeGroup',
  'anyAttribute'];

module.exports = ComplexType;
