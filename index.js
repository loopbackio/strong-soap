// Copyright IBM Corp. 2011,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var base = './src/';
var nodeVersion = process.versions.node;

var securityModules = require(base + 'security/index');

module.exports = {
  'soap': require(base + 'soap'),
  'http': require(base + 'http'),
  'QName': require(base + 'parser/qname'),
  'WSDL': require(base + 'parser/wsdl'),
};

for (var i in securityModules) {
  module.exports[i] = securityModules[i];
}


