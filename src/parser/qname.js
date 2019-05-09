// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var g = require('../globalize');
var assert = require('assert');
var qnameExp = /^(?:\{([^\{\}]*)\})?(?:([^\{\}]+):)?([^\{\}\:]+)$/;

class QName {
  /**
   * Create a new QName
   * - new QName(name)
   * - new QName(nsURI, name)
   * - new QName(nsURI, name, prefix)
   *
   * @param {string} nsURI Namespace URI
   * @param {string} name Local name
   * @param {string} prefix Namespace prefix
   */
  constructor(nsURI, name, prefix) {
    if (arguments.length === 1) {
      assert.equal(typeof nsURI, 'string',
        'The qname must be string in form of {nsURI}prefix:name');
      let qname;
      if (qname = qnameExp.exec(nsURI)) {
        this.nsURI = qname[1] || '';
        this.prefix = qname[2] || '';
        this.name = qname[3] || '';
      } else {
        throw new Error(g.f('Invalid qname: %s', nsURI));
      }
    } else {
      this.nsURI = nsURI || '';
      this.name = name || '';
      if (!prefix) {
        let parts = this.name.split(':');
        this.name = parts[0];
        this.prefix = parts[1];
      } else {
        this.prefix = prefix || '';
      }
    }
  }

  /**
   * {nsURI}prefix:name
   * @returns {string}
   */
  toString() {
    var str = '';
    if (this.nsURI) {
      str = '{' + this.nsURI + '}';
    }
    if (this.prefix) {
      str += this.prefix + ':';
    }
    str += this.name;
    return str;
  }

  /**
   * Parse a qualified name (prefix:name)
   * @param {string} qname Qualified name
   * @param {string|NamespaceContext} nsURI
   * @returns {QName}
   */
  static parse(qname, nsURI) {
    qname = qname || '';
    var result = new QName(qname);
    var uri;
    if (nsURI == null) {
      uri = '';
    } else if (typeof nsURI === 'string') {
      uri = nsURI;
    } else if (typeof nsURI.getNamespaceURI === 'function') {
      uri = nsURI.getNamespaceURI(result.prefix);
    } else {
      uri = '';
    }
    if (uri) {
      result.nsURI = uri;
    }
    return result;
  }
}

module.exports = QName;

