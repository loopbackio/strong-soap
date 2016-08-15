var EventEmitter = require('events').EventEmitter;
var NamespaceContext = require('./parser/nscontext');
var SOAPElement = require('./soapModel').SOAPElement;
var xmlBuilder = require('xmlbuilder');
  
class Base extends EventEmitter {
  constructor(wsdl, options) {
    super();
    this.wsdl = wsdl;
    this._initializeOptions(options);
    this.soapHeaders = [];
    this.httpHeaders = {};
    this.bodyAttributes = [];
  }

  addSoapHeader(name, value, qname, options) {
    var header = new SOAPElement(name, value, qname, options);
    return this.soapHeaders.push(header) - 1;
  }

  changeSoapHeader(index, name, value, qname, options) {
    var header = new SOAPElement(name, value, qname, options);
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

  addBodyAttribute(value, qname) {
    this.bodyAttributes.push(bodyAttribute);
  }

  getBodyAttributes() {
    return this.bodyAttributes;
  }

  clearBodyAttributes() {
    this.bodyAttributes = [];
  }

  _initializeOptions(options) {
    options = options || {};
    this.wsdl.options.attributesKey = options.attributesKey || 'attributes';
    this.wsdl.options.envelopeKey = options.envelopeKey || 'soap';
    this.wsdl.options.forceSoap12Headers = !!options.forceSoap12Headers;
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

}

module.exports = Base;
