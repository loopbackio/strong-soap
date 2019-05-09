// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var helper = require('./helper');
var builtinTypes;

function getBuiltinTypes() {
  if (builtinTypes) return builtinTypes;
  builtinTypes = {};
  var SimpleType = require('./xsd/simpleType');
  for (let t in helper.schemaTypes) {
    let type = new SimpleType('xsd:simpleType',
      {name: t, 'xmlns:xsd': helper.namespaces.xsd}, {});
    type.targetNamespace = helper.namespaces.xsd;
    type.jsType = helper.schemaTypes[t];
    builtinTypes[t] = type;
  }
  return builtinTypes;
}

exports.getBuiltinTypes = getBuiltinTypes;

exports.getBuiltinType = function(name) {
  return getBuiltinTypes()[name];
};


function parse(value, type) {
  var SimpleType = require('./xsd/simpleType');
}
