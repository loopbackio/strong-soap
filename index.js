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


