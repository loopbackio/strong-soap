'use strict';

var WSDLElement = require('../wsdl/wsdlElement');
var QName = require('../qname');
var Request = require('./request');

class Response extends Request {

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var representations = this.describeRepresentations(definitions);
    this.descriptor = {
      status: this.$status,
      representations: representations,
    };
    return this.descriptor;
  }

}

Response.elementName = 'response';
Response.targetNamespace = "http://wadl.dev.java.net/2009/02";
Response.allowedChildren = ['representation', 'documentation'];

module.exports = Response;
