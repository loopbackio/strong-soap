// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var SOAPElement = require('./soapElement');
var helper = require('../helper');

/**
 * <soap:fault name="nmtoken" use="literal|encoded" 
 * encodingStyle="uri-list"? namespace="uri"?>
 */
class Fault extends SOAPElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Fault.elementName = 'fault';
Fault.allowedChildren = ['documentation'];

module.exports = Fault;
