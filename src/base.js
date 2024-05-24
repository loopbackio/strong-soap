// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var EventEmitter = require('events').EventEmitter;
var NamespaceContext = require('./parser/nscontext');
var SOAPElement = require('./soapModel').SOAPElement;
var xmlBuilder = require('xmlbuilder');
var XMLHandler = require('./parser/xmlHandler');
  
class Base extends EventEmitter {
  constructor(wsdl, options) {
    super();
    this.wsdl = wsdl;
    this._initializeOptions(options);
    this.soapHeaders = [];
    this.httpHeaders = {};
    this.bodyAttributes = [];
  }

  addSoapHeader(value, qname) {
    var header = new SOAPElement(value, qname, null);
    return this.soapHeaders.push(header) - 1;
  }

  changeSoapHeader(index, value, qname) {
    var header = new SOAPElement(value, qname, null);
    this.soapHeaders[index] = header;
  }


  getSoapHeaders() {
    return this.soapHeaders;
  }

  clearSoapHeaders() {
    this.soapHeaders = [];
  }

  setHttpHeader(name, value) {
    this.httpHeaders[name] = String(value);
  }

  addHttpHeader(name, value) {
    var val = this.httpHeaders[name];
    if (val != null) {
      this.httpHeaders[name] = val + ', ' + value;
    } else {
      this.httpHeaders[name] = String(value);
    }
  }

  getHttpHeaders() {
    return this.httpHeaders;
  }

  clearHttpHeaders() {
    this.httpHeaders = {};
  }

  _initializeOptions(options) {
    options = options || {};
    this.wsdl.options.attributesKey = options.attributesKey || 'attributes';
    this.wsdl.options.envelopeKey = options.envelopeKey || 'soap';
    this.wsdl.options.forceSoapVersion = options.forceSoapVersion;
    this.wsdl.options.prettyResponse = options.prettyResponse !== undefined ? options.prettyResponse : true;
  }

  static createSOAPEnvelope(prefix, nsURI) {
    prefix = prefix || 'soap';
    nsURI = nsURI || 'http://schemas.xmlsoap.org/soap/envelope/';
    var doc = xmlBuilder.create(prefix + ':Envelope',
      {version: '1.0', encoding: 'UTF-8', standalone: true});
    doc.attribute('xmlns:' + prefix, nsURI);
    let header = doc.element(prefix + ':Header');
    let body = doc.element(prefix + ':Body');
    return {
      body: body,
      header: header,
      doc: doc
    };
  }

  findElement(nsURI, name) {
    var schemas = this.wsdl.definitions.schemas;
    var schema = schemas[nsURI];
    return schema && schema.elements[name];
  }

  createNamespaceContext(soapNsPrefix, soapNsURI) {
    var nsContext = new NamespaceContext();
    nsContext.declareNamespace(soapNsPrefix, soapNsURI);

    var namespaces = this.wsdl.definitions.xmlns || {};
    for (var prefix in namespaces) {
      if (prefix === '')
        continue;
      var nsURI = namespaces[prefix];
      switch (nsURI) {
        case "http://xml.apache.org/xml-soap" : // apachesoap
        case "http://schemas.xmlsoap.org/wsdl/" : // wsdl
        case "http://schemas.xmlsoap.org/wsdl/soap/" : // wsdlsoap
        case "http://schemas.xmlsoap.org/wsdl/soap12/": // wsdlsoap12
        case "http://schemas.xmlsoap.org/soap/encoding/" : // soapenc
        case "http://www.w3.org/2001/XMLSchema" : // xsd
          continue;
      }
      if (~nsURI.indexOf('http://schemas.xmlsoap.org/'))
        continue;
      if (~nsURI.indexOf('http://www.w3.org/'))
        continue;
      if (~nsURI.indexOf('http://xml.apache.org/'))
        continue;
      nsContext.addNamespace(prefix, nsURI);
    }
    return nsContext;
  }

  addSoapHeadersToEnvelope(soapHeaderElement, xmlHandler) {
    for (let i = 0, n = this.soapHeaders.length; i < n; i++) {
      let soapHeader = this.soapHeaders[i];
      let elementDescriptor;
      if (typeof soapHeader.value === 'object') {
        if (soapHeader.qname && soapHeader.qname.nsURI) {
            let element = this.findElement(soapHeader.qname.nsURI, soapHeader.qname.name);
            elementDescriptor =
              element && element.describe(this.wsdl.definitions);
        }
        xmlHandler.jsonToXml(soapHeaderElement, null, elementDescriptor,
          soapHeader.value);
      } else { //soapHeader has XML value
        XMLHandler.parseXml(soapHeaderElement, soapHeader.xml);
      }
    }
  }

}

module.exports = Base;
