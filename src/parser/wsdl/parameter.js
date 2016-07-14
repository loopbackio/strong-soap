var WSDLElement = require('./wsdlElement');
var QName = require('../qname');
var debug = require('debug')('node-soap:wsdl:parameter');

/**
 * Base class for Input/Output
 */
class Parameter extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  addChild(child) {
    // soap:body
    if (child.name === 'body') {
      this.body = child;
    } else if (child.name === 'header') {
      this.headers = this.headers || [];
      // soap:header
      this.headers.push(child);
    } else if (child.name === 'fault') {
      this.fault = child;
    }
  }

  postProcess(definitions) {
    // portType.operation.*
    if (this.parent.parent.name === 'portType') {
      // Resolve $message
      var messageName = QName.parse(this.$message).name;
      var message = definitions.messages[messageName];
      message.postProcess(definitions);
      this.message = message;
    }

    // binding.operation.*
    if (this.parent.parent.name === 'binding') {
      if (this.body) {
        if (this.body.$parts) {
          this.body.parts = {};
          let parts = this.body.$parts.split(/\s+/);
          for (let i = 0, n = parts.length; i < n; i++) {
            this.body.parts[part] = this.message.parts[parts[i]];
          }
        } else {
          if (this.message && this.message.parts) {
            this.body.parts = this.message.parts;
          }
        }
      }
      if (this.headers) {
        for (let i = 0, n = this.headers.length; i < n; i++) {
          let header = this.headers[i];
          let message;
          if (header.$message) {
            let messageName = QName.parse(header.$message).name;
            message = definitions.messages[messageName];
            if (message) {
              message.postProcess(definitions);
            } else {
              debug('Message not found: ', header.$message);
            }
          } else {
            message = this.message;
          }
          if (header.$part && message) {
            header.part = message.parts[header.$part];
          }
        }
      }
      if (this.fault) {
        let message = this.fault.parent.message;
        if (message) {
          message.postProcess(definitions);
          for (let p in message.parts) {
            // The fault message MUST have only one part per WSDL 1.1 spec
            this.fault.part = message.parts[p];
            break;
          }
        } else {
          debug('Message not found: ', this.fault.$message);
        }
      }
    }
  }
}

Parameter.allowedChildren = ['body', 'SecuritySpecRef', 'documentation', 'header'];

module.exports = Parameter;
