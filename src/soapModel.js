// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var assert = require('assert');
var QName = require('./parser/qname');

/**
 * Representation for soap elements
 */
class SOAPElement {
  constructor(value, qname, options) {
    if (typeof value === 'string' && !qname) {
      this.xml = value;
    } else {
      this.value = value;
      this.qname = qname;
      this.options = options || {};
    }
  }

}

/**
 * Representation for soap attributes
 */
class SOAPAttribute {
  constructor(value, qname) {
    assert(qname, 'qname is required');
    this.value = String(value);
    this.qname = qname;
  }

  addTo(parent, nsContext, xmlHandler) {
    var nsURI = nsContext.getNamespaceURI(this.qname.prefix);
    if(nsURI === this.qname.nsURI) {
      var name = this.qname.prefix + ':' + this.qname.name;
      parent.attribute(name, this.value);
    } else {
      nsContext.declareNamespace(this.qname.prefix, this.qname.nsURI);
    }
  }
}

exports.SOAPElement = SOAPElement;
exports.SOAPAttribute = SOAPAttribute;
