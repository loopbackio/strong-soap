// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Parameter = require('./parameter');

class Fault extends Parameter {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Fault.elementName = 'fault';
Fault.allowedChildren = ['documentation', 'fault'];

module.exports = Fault;
