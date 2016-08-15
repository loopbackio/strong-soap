var assert = require('assert');
var QName = require('./parser/qname');

/**
 * Representation for soap elements
 */
class SOAPElement {
  constructor(name, value, qname, options) {
    if (typeof value === 'string' && !qname) {
      this.xml = value;
    } else {
      this.name = name;
      this.value = value;
      this.qname = qname;
      this.options = options || {};
    }
  }

  addTo(parent, nsContext, xmlHandler) {
    if (this.xml) {
      xmlHandler.parseXml(parent, xml);
    } else {
      xmlHandler.jsonToXml(parent, nsContext, null, this.qname, this.value);
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
