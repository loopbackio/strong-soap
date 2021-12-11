// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import crypto from 'crypto';

// Primitive data types
var primitiveDataTypes: Record<string, object> = {
  string: String,
  boolean: Boolean,
  decimal: Number,
  float: Number,
  double: Number,
  duration: Number,
  dateTime: Date,
  time: Date,
  date: Date,
  gYearMonth: Number,
  gYear: Number,
  gMonthDay: Number,
  gDay: Number,
  gMonth: Number,
  hexBinary: String,
  base64Binary: String,
  anyURI: String,
  QName: String,
  NOTATION: String
};

// Derived data types
var derivedDataTypes: Record<string, object> = {
  normalizedString: String,
  token: String,
  language: String,
  NMTOKEN: String,
  NMTOKENS: String,
  Name: String,
  NCName: String,
  ID: String,
  IDREF: String,
  IDREFS: String,
  ENTITY: String,
  ENTITIES: String,
  integer: Number,
  nonPositiveInteger: Number,
  negativeInteger: Number,
  long: Number,
  int: Number,
  short: Number,
  byte: Number,
  nonNegativeInteger: Number,
  unsignedLong: Number,
  unsignedInt: Number,
  unsignedShort: Number,
  unsignedByte: Number,
  positiveInteger: Number
};

// Built-in data types
export var schemaTypes = {};

for (let s in primitiveDataTypes) {
  schemaTypes[s] = primitiveDataTypes[s];
}
for (let s in derivedDataTypes) {
  schemaTypes[s] = derivedDataTypes[s];
}

export var namespaces: Record<string, string> = {
  wsdl: 'http://schemas.xmlsoap.org/wsdl/',
  soap: 'http://schemas.xmlsoap.org/wsdl/soap/',
  soap12: 'http://schemas.xmlsoap.org/wsdl/soap12/',
  http: 'http://schemas.xmlsoap.org/wsdl/http/',
  mime: 'http://schemas.xmlsoap.org/wsdl/mime/',
  soapenc: 'http://schemas.xmlsoap.org/soap/encoding/',
  soapenv: 'http://schemas.xmlsoap.org/soap/envelope/',
  xsi_rc: 'http://www.w3.org/2000/10/XMLSchema-instance',
  xsd_rc: 'http://www.w3.org/2000/10/XMLSchema',
  xsd: 'http://www.w3.org/2001/XMLSchema',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance',
  xml: 'http://www.w3.org/XML/1998/namespace'
};

export function xmlEscape(obj: string): string {
  if (typeof obj === 'string') {
    if (obj.substr(0, 9) === '<![CDATA[' && obj.substr(-3) === "]]>") {
      return obj;
    }
    return obj
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  return obj;
}

export function passwordDigest(nonce: string, created: string, password: string) {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = Buffer.from(nonce || '', 'base64').toString('binary');
  pwHash.update(rawNonce + created + password);
  return pwHash.digest('base64');
};

export var EMPTY_PREFIX = ''; // Prefix for targetNamespace

/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
export function findPrefix<T extends Record<string, string>>(xmlnsMapping: T, nsURI: string): keyof T {
  for (var n in xmlnsMapping) {
    if (n === EMPTY_PREFIX) continue;
    if (xmlnsMapping[n] === nsURI)
      return n;
  }
};

export function extend<T extends object>(base: T, obj: object): T {
  if (base !== null && typeof base === "object" &&
    obj !== null && typeof obj === "object") {
    Object.keys(obj).forEach(function(key) {
      if (!base.hasOwnProperty(key))
        base[key] = obj[key];
    });
  }
  return base;
};

class _Set<T> {
  set: Set<T> | T[];

  constructor() {
    this.set = typeof Set === 'function' ? new Set() : [];
  }

  add(val: T) {
    if (Array.isArray(this.set)) {
      if (this.set.indexOf(val) === -1) {
        this.set.push(val);
      }
    } else {
      this.set.add(val);
    }
    return this;
  }

  has(val: T) {
    if (Array.isArray(this.set)) {
      return this.set.indexOf(val) !== -1;
    } else {
      return this.set.has(val);
    }
  }
}

exports.Set = _Set;

