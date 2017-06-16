'use strict';

// Primitive data types
var primitiveDataTypes = {
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
var derivedDataTypes = {
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
var schemaTypes = {};

for (let s in primitiveDataTypes) {
  schemaTypes[s] = primitiveDataTypes[s];
}
for (let s in derivedDataTypes) {
  schemaTypes[s] = derivedDataTypes[s];
}

var namespaces = {
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

function xmlEscape(obj) {
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

var crypto = require('crypto');
exports.passwordDigest = function passwordDigest(nonce, created, password) {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = new Buffer(nonce || '', 'base64').toString('binary');
  pwHash.update(rawNonce + created + password);
  return pwHash.digest('base64');
};

var EMPTY_PREFIX = ''; // Prefix for targetNamespace

exports.EMPTY_PREFIX = EMPTY_PREFIX;

/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
exports.findPrefix = function(xmlnsMapping, nsURI) {
  for (var n in xmlnsMapping) {
    if (n === EMPTY_PREFIX) continue;
    if (xmlnsMapping[n] === nsURI)
      return n;
  }
};

exports.extend = function extend(base, obj) {
  if (base !== null && typeof base === "object" &&
    obj !== null && typeof obj === "object") {
    Object.keys(obj).forEach(function(key) {
      if (!base.hasOwnProperty(key))
        base[key] = obj[key];
    });
  }
  return base;
};

exports.schemaTypes = schemaTypes;
exports.xmlEscape = xmlEscape;
exports.namespaces = namespaces;

class _Set {
  constructor() {
    this.set = typeof Set === 'function' ? new Set() : [];
  }

  add(val) {
    if (Array.isArray(this.set)) {
      if (this.set.indexOf(val) === -1) {
        this.set.push(val);
      }
    } else {
      this.set.add(val);
    }
    return this;
  }

  has(val) {
    if (Array.isArray(this.set)) {
      return this.set.indexOf(val) !== -1;
    } else {
      return this.set.has(val);
    }
  }
}

exports.Set = _Set;

