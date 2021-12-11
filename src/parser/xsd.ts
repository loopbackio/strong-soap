// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as helper from './helper';
import SimpleType from './xsd/simpleType'
var builtinTypes;

export function getBuiltinTypes(): SimpleType[] {
  if (builtinTypes) return builtinTypes;
  builtinTypes = {};
  for (let t in helper.schemaTypes) {
    let type = new SimpleType('xsd:simpleType',
      {name: t, 'xmlns:xsd': helper.namespaces.xsd}, {});
    type.targetNamespace = helper.namespaces.xsd;
    type.jsType = helper.schemaTypes[t];
    builtinTypes[t] = type;
  }
  return builtinTypes;
}

export function getBuiltinType(name) {
  return getBuiltinTypes()[name];
};


function parse(value, type) {
  var SimpleType = require('./xsd/simpleType');
}
