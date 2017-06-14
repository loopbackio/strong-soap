'use strict';

var g = require('../../globalize');
var XSDElement = require('./xsdElement');
var helper = require('../helper');
var QName = require('../qname');
var SimpleType = require('./simpleType');

class List extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  postProcess(definitions) {
    if (this.itemType !== undefined) {
      return;
    }
    var self = this;
    if (this.$itemType) {
      var qname = QName.parse(this.$itemType);
      this.itemType = this.resolveSchemaObject(definitions.schemas,
        'simpleType', this.$itemType);
    }
    this.children.forEach(function(c) {
      if (c instanceof SimpleType) {
        if (self.$itemType) {
          g.warn('Attribute {{itemType}} is not allowed if the content ' +
            'contains a {{simpleType}} element');
        } else if (self.itemType) {
          g.warn('List can only contain one {{simpleType}} element');
        }
        self.itemType = c;
      }
    });
    if (!this.itemType) {
      g.warn('List must have an item type');
    }
  }
}

List.elementName = 'list';
List.allowedChildren = ['annotation', 'simpleType'];

module.exports = List;
