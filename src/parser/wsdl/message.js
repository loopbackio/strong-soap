'use strict';

var WSDLElement = require('./wsdlElement');
var descriptor = require('../xsd/descriptor');
var helper = require('../helper');
var assert = require('assert');
var QName = require('../qname');

class Message extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.parts = {};
  }

  addChild(child) {
    if (child.name === 'part') {
      this.parts[child.$name] = child;
    }
  }

  postProcess(definitions) {
    for (var p in this.parts) {
      this.parts[p].postProcess(definitions);
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    this.descriptor = new descriptor.TypeDescriptor();
    for (var part in this.parts) {
      var p = this.parts[part];
      var partDescriptor = p.describe(definitions);
      if (partDescriptor instanceof descriptor.TypeDescriptor) {
        var child = new descriptor.ElementDescriptor(new QName(p.$name),
          partDescriptor.type, 'unqualified', false);
        child.elements = partDescriptor.elements;
        child.attributes = partDescriptor.attributes;
        this.descriptor.add(child);
      } else {
        this.descriptor.add(partDescriptor);
      }
    }
  }
}

Message.elementName = 'message';
Message.allowedChildren = ['part', 'documentation'];

module.exports = Message;

