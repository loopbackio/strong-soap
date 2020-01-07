// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/**
 * XML Schema Elements
 *
 * element --> @name|@ref|@type|@maxOccurs|@minOccurs|
 *             simpleType|complexType
 * simpleType --> @name|restriction
 * complexType --> @name|simpleContent|complexContent|
 *                 group|all|choice|sequence|
 *                 attribute|attributeGroup
 * simpleContent --> restriction|extension
 * complexContent --> restriction|extension
 * restriction -->
 *   simpleType: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
 *               totalDigits|fractionDigits|length|minLength|maxLength|
 *               enumeration|whiteSpace|pattern
 *   simpleContent: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
 *                  totalDigits|fractionDigits|length|minLength|maxLength|
 *                  enumeration|whiteSpace|pattern|
 *                  attribute|attributeGroup
 *   complexContent: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
 *                   totalDigits|fractionDigits|length|minLength|maxLength|
 *                   enumeration|whiteSpace|pattern|
 *                   group|all|choice|sequence|
 *                   attribute|attributeGroup
 * extension --> @base|group|all|choice|sequence|
 *               attribute|attributeGroup
 * group --> @name|@ref|all|choice|sequence
 * attribute --> @name|@ref|@default|@fixed|@type|@use
 * attributeGroup --> @name|@ref|attribute|attributeGroup
 * all --> @maxOccurs|@minOccurs|element
 * choice --> @maxOccurs|@minOccurs|element|group|choice|sequence|any
 * sequence --> @maxOccurs|@minOccurs|element|group|choice|sequence|any
 */

var helper = require('./helper');

var elementTypes = [
  require('./xsd/all'),
  require('./xsd/annotation'),
  require('./xsd/any'),
  require('./xsd/anyAttribute'),
  require('./xsd/attribute'),
  require('./xsd/attributeGroup'),
  require('./xsd/choice'),
  require('./xsd/complexContent'),
  require('./xsd/complexType'),
  require('./xsd/documentation'),
  require('./xsd/element'),
  require('./xsd/unique'),
  require('./xsd/key'),
  require('./xsd/keyref'),
  require('./xsd/extension'),
  require('./xsd/group'),
  require('./xsd/import'),
  require('./xsd/include'),
  require('./xsd/restriction'),
  require('./xsd/sequence'),
  require('./xsd/simpleContent'),
  require('./xsd/simpleType'),
  require('./xsd/list'),
  require('./xsd/union'),
  require('./xsd/schema'),
  require('./wsdl/binding'),
  require('./wsdl/definitions'),
  require('./wsdl/fault'),
  require('./wsdl/import'),
  require('./wsdl/input'),
  require('./wsdl/message'),
  require('./wsdl/operation'),
  require('./wsdl/output'),
  require('./wsdl/part'),
  require('./wsdl/port'),
  require('./wsdl/portType'),
  require('./wsdl/service'),
  require('./wsdl/types'),
  require('./wsdl/documentation'),
  require('./soap/body'),
  require('./soap/header'),
  require('./soap/headerFault'),
  require('./soap/fault'),
  require('./soap12/body'),
  require('./soap12/header'),
  require('./soap12/headerFault'),
  require('./soap12/fault')
];

var registry;

function getRegistry() {
  if (registry) {
    return registry;
  }
  registry = {
    elementTypes: {},
    elementTypesByName: {}
  };
  elementTypes.forEach(function(type) {
    registry.elementTypes['{' + type.targetNamespace + '}' + type.elementName] = type;
    registry.elementTypesByName[type.elementName] = type;
  });
  return registry;
}

function getElementType(qname) {
  var registry = getRegistry();
  var ElementType =
    registry.elementTypes['{' + qname.nsURI + '}' + qname.name];
  if (!ElementType) {
    let XSDElement = require('./xsd/xsdElement');
    let WSDLElement = require('./wsdl/wsdlElement');
    let SOAPElement = require('./soap/soapElement');
    let SOAP12Element = require('./soap12/soapElement');
    let Element = require('./element');
    if (qname.nsURI === helper.namespaces.wsdl) {
      ElementType = WSDLElement;
    } else if (qname.nsURI === helper.namespaces.xsd) {
      ElementType = XSDElement;
    } else if (qname.nsURI === helper.namespaces.soap) {
      ElementType = SOAPElement;
    } else if (qname.nsURI === helper.namespaces.soap12) {
      ElementType = SOAP12Element;
    } else {
      ElementType = Element;
    }
  }
  return ElementType;
}

exports.getRegistry = getRegistry;
exports.getElementType = getElementType;
