/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

'use strict';

var HttpClient = require('./http'),
  assert = require('assert'),
  xmlBuilder = require('xmlbuilder'),
  XMLHandler = require('./parser/xmlHandler'),
  NamespaceContext = require('./parser/nscontext'),
  Operation = require('./parser/wsdl/operation'),
  SOAPElement = require('./soapModel').SOAPElement,
  Base = require('./base'),
  util = require('util'),
  _ = require('lodash'),
  debug = require('debug')('node-soap:client');

class Client extends Base {
  constructor(wsdl, endpoint, options) {
    super(wsdl, options);
    options = options || {};
    this.xmlHandler = new XMLHandler(options);
    this._initializeServices(endpoint);
    this.httpClient = options.httpClient || new HttpClient(options);
  }

  setEndpoint(endpoint) {
    this.endpoint = endpoint;
    this._initializeServices(endpoint);
  }

  describe() {
    return this.wsdl.describeServices();
  }

  setSecurity(security) {
    this.security = security;
  }

  setSOAPAction(soapAction) {
    this.SOAPAction = soapAction;
  }

  _initializeServices(endpoint) {
    var definitions = this.wsdl.definitions;
    var services = definitions.services;
    for (var name in services) {
      this[name] = this._defineService(services[name], endpoint);
    }
  }

  _defineService(service, endpoint) {
    var ports = service.ports;
    var def = {};
    for (var name in ports) {
      def[name] = this._definePort(ports[name],
        endpoint ? endpoint : ports[name].location);
    }
    return def;
  }

  _definePort(port, endpoint) {
    var location = endpoint;
    var binding = port.binding;
    var operations = binding.operations;
    var def = {};
    for (var name in operations) {
      def[name] = this._defineOperation(operations[name], location);
      this[name] = def[name];
    }
    return def;
  }

  _defineOperation(operation, location) {
    var self = this;
    var temp;
    return function(args, callback, options, extraHeaders) {
      if (typeof args === 'function') {
        callback = args;
        args = {};
      } else if (typeof options === 'function') {
        temp = callback;
        callback = options;
        options = temp;
      } else if (typeof extraHeaders === 'function') {
        temp = callback;
        callback = extraHeaders;
        extraHeaders = options;
        options = temp;
      }
      self._invoke(operation, args, location,
        function(error, result, raw, soapHeader) {
          callback(error, result, raw, soapHeader);
        }, options, extraHeaders);
    };
  }

  

  _invoke(operation, args, location, callback, options, extraHeaders) {
    var self = this,
      name = operation.$name,
      input = operation.input,
      output = operation.output,
      style = operation.style,
      defs = this.wsdl.definitions,
      ns = defs.$targetNamespace,
      encoding = '',
      message = '',
      xml = null,
      req = null,
      soapAction,
      headers = {
        'Content-Type': 'text/xml; charset=utf-8'
      };

    var soapNsURI = 'http://schemas.xmlsoap.org/soap/envelope/';
    var soapNsPrefix = this.wsdl.options.envelopeKey || 'soap';

    if (this.wsdl.options.forceSoap12Headers) {
      headers['Content-Type'] = 'application/soap+xml; charset=utf-8';
      soapNsURI = 'http://www.w3.org/2003/05/soap-envelope';
    }

    if (this.SOAPAction) {
      soapAction = this.SOAPAction;
    } else if (operation.soapAction != null) {
      soapAction = operation.soapAction;
    } else {
      soapAction = ((ns.lastIndexOf("/") !== ns.length - 1) ? ns + "/" : ns) + name;
    }

    if (!this.wsdl.options.forceSoap12Headers) {
      headers.SOAPAction = '"' + soapAction + '"';
    }

    options = options || {};

    //Add extra headers
    for (var header in this.httpHeaders) {
      headers[header] = this.httpHeaders[header];
    }
    for (var attr in extraHeaders) {
      headers[attr] = extraHeaders[attr];
    }

    // Allow the security object to add headers
    if (self.security && self.security.addHttpHeaders)
      self.security.addHttpHeaders(headers);
    if (self.security && self.security.addOptions)
      self.security.addOptions(options);

    var nsContext = this.createNamespaceContext(soapNsPrefix, soapNsURI);
    var xmlHandler = new XMLHandler(options);
    var envelope = Client.createSOAPEnvelope(soapNsPrefix, soapNsURI);

    var soapHeaderElement = envelope.header;
    var soapBodyElement = envelope.body;

    for (let i = 0, n = this.soapHeaders.length; i < n; i++) {
      let soapHeader = this.soapHeaders[i];
      if (soapHeader.qname.nsURI === null || soapHeader.qname.nsURI === undefined) {
        continue;
      }
      let element = this.findElement(soapHeader.qname.nsURI, soapHeader.name);
      let elementDescriptor =
        element && element.describe(this.wsdl.definitions);
      xmlHandler.jsonToXml(soapHeaderElement, nsContext, elementDescriptor,
        soapHeader.value);
    }

    if (self.security && self.security.addSoapHeaders) {
      xml = self.security.addSoapHeaders(envelope.header);
    }

    var operationDescriptor = operation.describe(this.wsdl.definitions);
    var inputBodyDescriptor = operationDescriptor.input.body;
    var inputHeadersDescriptor = operationDescriptor.input.headers;

    if (operation.style === Operation.Style.documentLiteralWrapped) {
      // For document literal wrapper style, allow skipping of wrapper element
      if (args == null || typeof args !== 'object' || !(operation.$name in args)) {
        let wrapper = {};
        wrapper[operation.$name] = args;
        args = wrapper;
      }
    }

    xmlHandler.jsonToXml(soapBodyElement, nsContext, inputBodyDescriptor, args);

    if (self.security && self.security.postProcess) {
      self.security.postProcess(envelope.header, envelope.body);
    }

    message = envelope.body.toString({pretty: true});
    xml = envelope.doc.end({pretty: true});

    debug('Request envelope: %s', xml);

    self.lastMessage = message;
    self.lastRequest = xml;
    self.lastEndpoint = location;

    self.emit('message', message);
    self.emit('request', xml);

    var tryJSONparse = function(body) {
      try {
        return JSON.parse(body);
      }
      catch (err) {
        return undefined;
      }
    };

    req = self.httpClient.request(location, xml, function(err, response, body) {
      var result;
      var obj;
      self.lastResponse = body;
      self.lastResponseHeaders = response && response.headers;
      self.lastElapsedTime = response && response.elapsedTime;
      self.emit('response', body, response);

      if (err) {
        callback(err);
      } else {

        var outputEnvDescriptor = operationDescriptor.outputEnvelope;
        try {
          obj = xmlHandler.xmlToJson(nsContext, body, outputBodyDescriptor);
        } catch (error) {
          //  When the output element cannot be looked up in the wsdl and the body is JSON
          //  instead of sending the error, we pass the body in the response.
          if (!output) {
            debug('Response element is not present. Unable to convert response xml to json.');
            //  If the response is JSON then return it as-is.
            var json = _.isObject(body) ? body : tryJSONparse(body);
            if (json) {
              return callback(null, response, json);
            }
          }
          error.response = response;
          error.body = body;
          self.emit('soapError', error);
          return callback(error, response, body);
        }

        if (!output) {
          // one-way, no output expected
          return callback(null, null, body, obj.Header);
        }
        if (typeof obj.Body !== 'object') {
          var error = new Error('Cannot parse response');
          error.response = response;
          error.body = body;
          return callback(error, obj, body);
        }

        var outputBodyDescriptor = operationDescriptor.output.body;
        var outputHeadersDescriptor = operationDescriptor.output.headers;

        result = obj.Body[outputBodyDescriptor.elements[0].qname.name];
        // RPC/literal response body may contain elements with added suffixes I.E.
        // 'Response', or 'Output', or 'Out'
        // This doesn't necessarily equal the ouput message name. See WSDL 1.1 Section 2.4.5
        if (!result) {
          var outputName = output.$name &&
            output.$name.replace(/(?:Out(?:put)?|Response)$/, '');
          result = obj.Body[outputName];
        }
        if (!result) {
          ['Response', 'Out', 'Output'].forEach(function(term) {
            if (obj.Body.hasOwnProperty(name + term)) {
              return result = obj.Body[name + term];
            }
          });
        }

        callback(null, result, body, obj.Header);
      }
    }, headers, options, self);

    // Added mostly for testability, but possibly useful for debugging
    self.lastRequestHeaders = req.headers;
  }
}

module.exports = Client;
