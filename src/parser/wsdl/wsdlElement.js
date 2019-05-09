// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Element = require('../element');

class WSDLElement extends Element {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

WSDLElement.targetNamespace = Element.namespaces.wsdl;
WSDLElement.allowedChildren = ['documentation'];

module.exports = WSDLElement;
