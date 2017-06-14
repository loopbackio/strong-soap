'use strict';

var WSDLElement = require('./wsdlElement');

class PortType extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  postProcess(definitions) {
    if (this.operations) return;
    this.operations = {};
    var children = this.children;
    if (typeof children === 'undefined')
      return;
    for (var i = 0, child; child = children[i]; i++) {
      if (child.name !== 'operation')
        continue;
      child.postProcess(definitions);
      this.operations[child.$name] = child;
    }
  }

  describe(definitions) {
    var operations = {};
    for (var name in this.operations) {
      var method = this.operations[name];
      operations[name] = method.describe(definitions);
    }
    return operations;
  };
}

PortType.elementName = 'portType';
PortType.allowedChildren = ['operation', 'documentation'];

module.exports = PortType;
