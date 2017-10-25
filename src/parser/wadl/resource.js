'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');

class Resource extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.methods = {};
  }

  postProcess(definitions) {
    var children = this.children;
    if (children && children.length > 0) {
      for (var i = 0, child; child = children[i]; i++) {
        if (child.name !== 'method')
          continue;
        child.postProcess(definitions);
        this.methods[child.$id] = child;
        children.splice(i--, 1);
      }
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var methods = {};
    for (var name in this.methods) {
      var method = this.methods[name];
      methods[name] = method.describe(definitions);
    }
    this.descriptor = {
      id: this.$id,
      path: this.$path,
      methods: methods,
    };
    return this.descriptor;
  }

}

Resource.elementName = 'resource';
Resource.targetNamespace = "http://wadl.dev.java.net/2009/02";
Resource.allowedChildren = ['documentation', 'doc', 'param', 'method', 'resource'];

module.exports = Resource;
