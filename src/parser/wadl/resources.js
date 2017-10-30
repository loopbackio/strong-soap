'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');

class Resources extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.resources = {};
  }

  postProcess(definitions) {
    var children = this.children;
    if (children && children.length > 0) {
      for (var i = 0, child; child = children[i]; i++) {
        if (child.name !== 'resource')
          continue;
        child.postProcess(definitions);
        this.resources[child.$id] = child;
        children.splice(i--, 1);
      }
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var resources = {};
    for (var name in this.resources) {
      var resource = this.resources[name];
      resources[name] = resource.describe(definitions);
    }
    this.descriptor = {
      base: this.$base,
      resources: resources,
    };
    return this.descriptor;
  }

}

Resources.elementName = 'resources';
Resources.targetNamespace = "http://wadl.dev.java.net/2009/02";
Resources.allowedChildren = ['resource'];

module.exports = Resources;
