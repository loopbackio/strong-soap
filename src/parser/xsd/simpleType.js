'use strict';

var XSDElement = require('./xsdElement');
var descriptor = require('./descriptor');
var helper = require('../helper');
var xsd = require('../xsd');

class SimpleType extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  addChild(child) {
    this[child.name] = child;
  }

  describe(definitions) {
    var descriptor = this.descriptor = new XSDElement.TypeDescriptor();
    descriptor.name = this.$name || this.name;
    descriptor.xmlns = this.nsURI;
    descriptor.isSimple = true;
    return descriptor;
  }

  postProcess(definitions) {
    if (this.type !== undefined) return;
    this.type = String; // Default to String
    if (this.targetNamespace === helper.namespaces.xsd) {
      this.type = xsd.getBuiltinType(this.$name).jsType;
      return;
    }
    if (this.restriction) {
      this.restriction.postProcess(definitions);
      if (this.restriction.base) {
        // Use the base type
        this.type = this.restriction.base.type;
      }
    } else if (this.list) {
      this.list.postProcess(definitions);
      if (this.list.itemType) {
        this.list.itemType.postProcess(definitions);
        this.type = [this.list.itemType.type];
      }
    } else if (this.union) {
      let memberTypes = [];
      memberTypes.union = true; // Set the union flag to true
      this.union.postProcess(definitions);
      if (this.union.memberTypes) {
        this.union.memberTypes.forEach(function(t) {
          t.postProcess(definitions);
          memberTypes.push(t.type);
        });
        this.type = memberTypes;
      }
    }
  }
}

SimpleType.elementName = 'simpleType';
SimpleType.allowedChildren = ['annotation', 'list', 'union', 'restriction'];

module.exports = SimpleType;
