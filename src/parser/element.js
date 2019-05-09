// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var g = require('../globalize');
var assert = require('assert');
var QName = require('./qname');
var typeRegistry = require('./typeRegistry');
var helper = require('./helper');
var xsd = require('./xsd');
var debug = require('debug')('strong-soap:wsdl:element');

var EMPTY_PREFIX = helper.EMPTY_PREFIX;
var namespaces = helper.namespaces;

/**
 * Base class for all elements of WSDL/XSD
 */
class Element {
  constructor(nsName, attrs, options) {
    var qname = QName.parse(nsName);

    this.nsName = nsName;
    this.prefix = qname.prefix;
    this.name = qname.name;
    this.nsURI = '';
    this.parent = null;
    this.children = [];
    this.xmlns = {};

    if (this.constructor.elementName) {
      assert(this.name === this.constructor.elementName,
        'Invalid element name: ' + this.name);
    }

    this._initializeOptions(options);

    for (var key in attrs) {
      var match = /^xmlns:?(.*)$/.exec(key);
      if (match) {
        if (attrs[key] === namespaces.xsd_rc) {
          // Handle http://www.w3.org/2000/10/XMLSchema
          attrs[key] = namespaces.xsd;
        }
        if (attrs[key] === namespaces.xsi_rc) {
          // Handle http://www.w3.org/2000/10/XMLSchema-instance
          attrs[key] = namespaces.xsi;
        }
        this.xmlns[match[1] ? match[1] : EMPTY_PREFIX] = attrs[key];
      }
      else {
        if (key === 'value') {
          this[this.valueKey] = attrs[key];
        } else {
          this['$' + key] = attrs[key];
        }
      }
    }
    if (this.$targetNamespace) {
      this.targetNamespace = this.$targetNamespace;
    }
  }

  _initializeOptions(options) {
    if (options) {
      this.valueKey = options.valueKey || '$value';
      this.xmlKey = options.xmlKey || '$xml';
      this.ignoredNamespaces = options.ignoredNamespaces || [];
      this.forceSoapVersion = options.forceSoapVersion;
    } else {
      this.valueKey = '$value';
      this.xmlKey = '$xml';
      this.ignoredNamespaces = [];
    }
  }

  startElement(stack, nsName, attrs, options) {
    if (!this.constructor.allowedChildren)
      return;

    var child;
    var parent = stack[stack.length - 1];

    var qname = this._qnameFor(stack, nsName, attrs, options);
    var ElementType = typeRegistry.getElementType(qname);
    if (this.constructor.allowedChildren.indexOf(qname.name) === -1 &&
      this.constructor.allowedChildren.indexOf('any') === -1) {
      debug('Element %s is not allowed within %j', qname, this.nsName);
    }
    
    if (ElementType) {
      child = new ElementType(nsName, attrs, options);
      child.nsURI = qname.nsURI;
      child.targetNamespace = attrs.targetNamespace || this.getTargetNamespace();
      debug('Element created: ', child);
      child.parent = parent;
      stack.push(child);
    } else {
      this.unexpected(nsName);
    }
  }

  endElement(stack, nsName) {
    if (this.nsName === nsName) {
      if (stack.length < 2)
        return;
      var parent = stack[stack.length - 2];
      if (this !== stack[0]) {
        helper.extend(stack[0].xmlns, this.xmlns);
        parent.children.push(this);
        parent.addChild(this);
      }
      stack.pop();
    }
  }

  _qnameFor(stack, nsName, attrs, options) {
    // Create a dummy element to help resolve the XML namespace
    var child = new Element(nsName, attrs, options);
    var parent = stack[stack.length - 1];
    child.parent = parent;

    var qname = QName.parse(nsName);
    qname.nsURI = child.getNamespaceURI(qname.prefix);
    return qname;
  }

  addChild(child) {
    return;
  }

  unexpected(name) {
    throw new Error(g.f('Found unexpected element (%s) inside %s', name, this.nsName));
  }

  describe(definitions) {
    return this.$name || this.name;
  }

  /**
   * Look up the namespace by prefix
   * @param {string} prefix Namespace prefix
   * @returns {string} Namespace
   */
  getNamespaceURI(prefix) {
    if (prefix === 'xml') return helper.namespaces.xml;
    var nsURI = null;
    if (this.xmlns && prefix in this.xmlns) {
      nsURI = this.xmlns[prefix];
    } else {
      if (this.parent) {
        return this.parent.getNamespaceURI(prefix);
      }
    }
    return nsURI;
  }

  /**
   * Get the target namespace URI
   * @returns {string} Target namespace URI
   */
  getTargetNamespace() {
    if (this.targetNamespace) {
      return this.targetNamespace;
    } else if (this.parent) {
      return this.parent.getTargetNamespace();
    }
    return null;
  }

  /**
   * Get the qualified name
   * @returns {QName} Qualified name
   */
  getQName() {
    return new QName(this.targetNamespace, this.$name);
  }

  /**
   * Resolve a schema object by qname
   * @param schemas
   * @param elementType
   * @param nsName
   * @returns {*}
   */
  resolveSchemaObject(schemas, elementType, nsName) {
    var qname = QName.parse(nsName);
    var nsURI;
    if (qname.prefix === 'xml') return null;
    if (qname.prefix) nsURI = this.getNamespaceURI(qname.prefix);
    else nsURI = this.getTargetNamespace();
    qname.nsURI = nsURI;
    var name = qname.name;
    if (nsURI === helper.namespaces.xsd &&
      (elementType === 'simpleType' || elementType === 'type')) {
      return xsd.getBuiltinType(name);
    }
    var schema = schemas[nsURI];
    if (!schema) {
      debug('Schema not found: %s (%s)', qname, elementType);
      return null;
    }
    var found = null;
    switch (elementType) {
      case 'element':
        found = schema.elements[name];
        break;
      case 'type':
        found = schema.complexTypes[name] || schema.simpleTypes[name];
        break;
      case 'simpleType':
        found = schema.simpleTypes[name];
        break;
      case 'complexType':
        found = schema.complexTypes[name];
        break;
      case 'group':
        found = schema.groups[name];
        break;
      case 'attribute':
        found = schema.attributes[name];
        break;
      case 'attributeGroup':
        found = schema.attributeGroups[name];
        break;
    }
    if (!found) {
      debug('Schema %s not found: %s %s', elementType, nsURI, nsName);
      return null;
    }
    return found;
  }

  postProcess(definitions) {
    debug('Unknown element: %s %s', this.nsURI, this.nsName)
  }
}

Element.EMPTY_PREFIX = EMPTY_PREFIX;
Element.namespaces = namespaces;

module.exports = Element;
