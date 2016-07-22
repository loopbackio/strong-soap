'use strict';

var base = './lib/';
var nodeVersion = process.versions.node;
var major = Number(nodeVersion.split('.')[0]);
if (major >= 5) {
  base = './src/';
}

module.exports = {
  'soap': require(base + 'soap'),
  'http': require(base + 'http'),
  'QName': require(base + 'parser/qname'),
  'WSDL': require(base + 'parser/wsdl'),
  'WSSecurity': require(base + 'security/WSSecurity')
};


