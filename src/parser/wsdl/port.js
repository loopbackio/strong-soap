// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
