// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Element = require('../element');

class SOAPElement extends Element {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);

    if(this.name === 'body' || this.name === 'header' ||
      this.name === 'fault' || this.name === 'headerfault') {
      this.use = this.$use;
      if (this.use === 'encoded') {
        this.encodingStyle = this.$encodingStyle;
      }
      // The namespace attribute of soap:body will be used for RPC style
      // operation
      this.namespace = this.$namespace;
    }
  }
}

SOAPElement.targetNamespace = Element.namespaces.soap12;
SOAPElement.allowedChildren = ['documentation'];

module.exports = SOAPElement;
