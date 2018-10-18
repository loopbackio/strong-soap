'use strict';

var WSDLElement = require('./wsdlElement');
var QName = require('../qname');

class Binding extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.transport = '';
    this.style = '';
  }

  addChild(child) {
    // soap:binding
    if (child.name === 'binding') {
      this.transport = child.$transport;
      this.style = child.$style;
    }
  }

  postProcess(definitions) {
    if (this.operations) return;
    try {
      this.operations = {};
      var type = QName.parse(this.$type).name,
        portType = definitions.portTypes[type],
        style = this.style,
        children = this.children;
      if (portType) {
        portType.postProcess(definitions);
        this.portType = portType;

        for (var i = 0, child; child = children[i]; i++) {
          if (child.name !== 'operation')
            continue;
          var operation = this.portType.operations[child.$name];
          if (operation) {
            this.operations[child.$name] = child;
            child.operation = operation;

            // Set portType.operation.input.message to binding.operation.input
            if (operation.input && child.input) {
              child.input.message = operation.input.message;
            }
            // Set portType.operation.output.message to binding.operation.output
            if (operation.output && child.output) {
              child.output.message = operation.output.message;
            }

            //portType.operation.fault is fully processed with message etc. Hence set to binding.operation.fault
            for (var f in operation.faults) {
              if (operation.faults[f]) {
                child.faults[f] = operation.faults[f];
              }
            }
            if (operation.$parameterOrder) {
              // For RPC style
              child.parameterOrder = operation.$parameterOrder.split(/\s+/);
            }
            child.style = child.style || style;
            child.postProcess(definitions);
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var operations = this.descriptor = {};
    for (var name in this.operations) {
      var operation = this.operations[name];
      operations[name] = operation.describe(definitions);
    }
    return operations;
  };
}

Binding.elementName = 'binding';
Binding.allowedChildren = ['binding', 'SecuritySpec', 'operation',
  'documentation'];

module.exports = Binding;
