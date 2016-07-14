'use strict';

var base = './lib/';
var nodeVersion = process.versions.node;
var major = Number(nodeVersion.split('.')[0]);
if (major >= 5) {
  base = './src/';
}

module.exports = require(base + 'soap');

