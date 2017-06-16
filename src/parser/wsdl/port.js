'use strict';

var WSDLElement = require('./wsdlElement');

class Port extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.location = null;
  }

  addChild(child) {
    // soap:address
    if (child.name === 'address' && child.$location !== undefined) {
      this.location = child.$location;
    }
  }
}

Port.elementName = 'port';
Port.allowedChildren = ['address', 'documentation'];

module.exports = Port;
