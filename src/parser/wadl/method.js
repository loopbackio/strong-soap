'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');

class Method extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.request = undefined;
    this.responses = [];
  }

  postProcess(definitions) {
    var children = this.children;
    if (children && children.length > 0) {
      for (var i = 0, child; child = children[i]; i++) {
        const isRequest = (child.name === "request");
        const isResponse = (child.name === "response");
        if (isRequest || isResponse) {
          child.postProcess(definitions);
          if (isRequest) {
            this.request = child;
          } else {
            this.responses.push(child);
          }
          children.splice(i--, 1);
        }
      }
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = {
      id: this.$id,
      name: this.$name,
      request: this.describeRequest(definitions),
      responses: this.describeResponses(definitions),
    };
    this.descriptor = descriptor;
    return this.descriptor;
  }

  describeRequest(definitions) {
    return this.request && this.request.describe(definitions);
  }

  describeResponses(definitions) {
    return this.responses.map(response => response.describe(definitions));
  }

}

Method.elementName = 'method';
Method.targetNamespace = "http://wadl.dev.java.net/2009/02";
Method.allowedChildren = ['request', 'response', 'documentation', 'doc'];

module.exports = Method;
