'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');

class Request extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.representations = [];
  }

  postProcess(definitions) {
    var children = this.children;
    if (children && children.length > 0) {
      for (var i = 0, child; child = children[i]; i++) {
        if (child.name !== 'representation')
          continue;
        child.postProcess(definitions);
        this.representations.push(child);
        children.splice(i--, 1);
      }
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var representations = this.describeRepresentations(definitions);
    this.descriptor = {
      representations: representations,
    };
    return this.descriptor;
  }

  describeRepresentations(definitions) {
    return this.representations.map(representation => representation.describe(definitions));
  }

}

Request.elementName = 'request';
Request.targetNamespace = "http://wadl.dev.java.net/2009/02";
Request.allowedChildren = ['representation', 'documentation'];

module.exports = Request;
