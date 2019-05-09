// Copyright IBM Corp. 2011,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var base = './lib/';
var nodeVersion = process.versions.node;
var major = Number(nodeVersion.split('.')[0]);
if (major >= 4) {
  base = './src/';
}

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


