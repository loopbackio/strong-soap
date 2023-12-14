// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var g = require('./globalize');
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
  debug = require('debug')('strong-soap:client'),
  debugDetail = require('debug')('strong-soap:client:detail'),
  debugSensitive = require('debug')('strong-soap:client:sensitive'),
  utils = require('./utils');

class Client extends Base {
  constructor(wsdl, endpoint, options) {
    super(wsdl, options);
    options = options || {};
    this.xmlHandler = new XMLHandler(wsdl.definitions.schemas, options);
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
      if (!args) args = {};
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
      } else if (typeof callback === 'object') {
        extraHeaders = options;
        options = callback;
        callback = undefined;
      }
      callback = callback || utils.createPromiseCallback();
      self._invoke(operation, args, location, callback, options, extraHeaders);
      return callback.promise;
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
      },
      dynamicSoapHeaderProperty = ['soapHeaders'],
      dynamicSoapHeaders = {};

    debug('client request. operation: %s args: %j options: %j extraHeaders: %j', operation.name, args, options, extraHeaders);

    var soapNsURI = 'http://schemas.xmlsoap.org/soap/envelope/';
    var soapNsPrefix = this.wsdl.options.envelopeKey || 'soap';

    var soapVersion = this.wsdl.options.forceSoapVersion || operation.soapVersion;

    if (soapVersion === '1.2') {
      headers['Content-Type'] = 'application/soap+xml; charset=utf-8';
      soapNsURI = 'http://www.w3.org/2003/05/soap-envelope';
    }

    debug('client request. soapNsURI: %s soapNsPrefix: %s ', soapNsURI, soapNsPrefix);

    if (this.SOAPAction) {
      soapAction = this.SOAPAction;
    } else if (operation.soapAction != null) {
      soapAction = operation.soapAction;
    } else {
      soapAction = ((ns.lastIndexOf("/") !== ns.length - 1) ? ns + "/" : ns) + name;
    }

    if (soapVersion !== '1.2' || operation.soapActionRequired) {
      headers.SOAPAction = '"' + soapAction + '"';
    }

    debug('client request. soapAction: %s', soapAction);

    options = options || {};
    debugSensitive('client request. options: %j', options);

    dynamicSoapHeaders = _.merge(_.pick(extraHeaders, dynamicSoapHeaderProperty),
	                       _.pick(options, dynamicSoapHeaderProperty));

    debug('Soap xml payload extra headers: %j', dynamicSoapHeaders);

    extraHeaders = _.omit(extraHeaders, dynamicSoapHeaderProperty);
    options = _.omit(options, dynamicSoapHeaderProperty);

    //Add extra headers to http request
    for (var header in this.httpHeaders) {
      headers[header] = this.httpHeaders[header];
    }
    for (var attr in extraHeaders) {
      headers[attr] = extraHeaders[attr];
    }

    // Clear and Add new SOAP Headers
     if (!_.isEmpty(dynamicSoapHeaders)) {             
        this.clearSoapHeaders();
        for (var attr in dynamicSoapHeaders) {
           this.addSoapHeader(dynamicSoapHeaders[attr]);
        }
    }
    
    debug('client request. headers: %j', headers);

    //Unlike other security objects, NTLMSecurity is passed in through client options rather than client.setSecurity(ntlmSecurity) as some
    //remote wsdl retrieval needs NTLM authentication before client object gets created. Hence, set NTLMSecurity instance to the client object
    //so that it will be similar to other security objects from this point onwards.
    if (self.httpClient.options && self.httpClient.options.NTLMSecurity) {
      self.security = self.httpClient.options.NTLMSecurity;
    }

    // Allow the security object to add headers
    if (self.security && self.security.addHttpHeaders) {
      self.security.addHttpHeaders(headers);
      debugSensitive('client request. options: %j', options);
    }
    if (self.security && self.security.addOptions) {
      self.security.addOptions(options);
      debugSensitive('client request. options: %j', options);
    }



    var nsContext = this.createNamespaceContext(soapNsPrefix, soapNsURI);
    var xmlHandler = this.xmlHandler || new XMLHandler(this.wsdl.schemas, options);
    var envelope = Client.createSOAPEnvelope(soapNsPrefix, soapNsURI);

    var soapHeaderElement = envelope.header;
    var soapBodyElement = envelope.body;
    //add soapHeaders to envelope. Header can be xml, or JSON object which may or may not be described in WSDL/XSD.
    this.addSoapHeadersToEnvelope(soapHeaderElement, this.xmlHandler);

    if (self.security && self.security.addSoapHeaders) {
      xml = self.security.addSoapHeaders(envelope.header);
    }

    let schemas = defs.schemas;


    for(let uri in schemas) {
      let complexTypes = schemas[uri].complexTypes;
      if(complexTypes) {
        for (let type in complexTypes) {
            complexTypes[type].describe(this.wsdl.definitions);
        }
      }
    }

    for(let uri in schemas) {
      let complexTypes = schemas[uri].complexTypes;
      if(complexTypes) {
        for (let type in complexTypes) {
          complexTypes[type].describeChildren(this.wsdl.definitions);
        }
      }
    }

    var operationDescriptor = operation.describe(this.wsdl.definitions);
    debugDetail('client request. operationDescriptor: %j', operationDescriptor);

    var inputBodyDescriptor = operationDescriptor.input.body;
    debug('client request. inputBodyDescriptor: %j', inputBodyDescriptor);

    var inputHeadersDescriptor = operationDescriptor.input.headers;


    debug('client request, calling jsonToXml. args: %j', args);
    xmlHandler.jsonToXml(soapBodyElement, nsContext, inputBodyDescriptor, args);

    if (self.security && self.security.postProcess) {
      self.security.postProcess(envelope.header, envelope.body);
    }

    //Bydefault pretty print is true and request envelope is created with newlines and indentations
    var prettyPrint = true;
    //some web services don't accept request envelope with newlines and indentations in which case user has to set {prettyPrint: false} as client option
    if (self.httpClient.options && self.httpClient.options.prettyPrint !== undefined) {
      prettyPrint = self.httpClient.options.prettyPrint;
    }

    message = envelope.body.toString({pretty: prettyPrint});
    xml = envelope.doc.end({pretty: prettyPrint});

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

      debug('client response. response: %j body: %j', response, body);

      if (err) {
        callback(err);
      } else {

        //figure out if this is a Fault response or normal output from the server.
        //There seem to be no good way to figure this out other than
        //checking for <Fault> element in server response.
        if (body.indexOf('<soap:Fault>') > -1  || body.indexOf('<Fault>') > -1) {
          var outputEnvDescriptor = operationDescriptor.faultEnvelope;
        } else  {
          var outputEnvDescriptor = operationDescriptor.outputEnvelope;
        }
        try {
          debugDetail('client response. outputEnvDescriptor: %j', outputEnvDescriptor);
          obj = xmlHandler.xmlToJson(nsContext, body, outputEnvDescriptor);
        } catch (error) {
          //  When the output element cannot be looked up in the wsdl and the body is JSON
          //  instead of sending the error, we pass the body in the response.
          debug('client response. error message: %s', error.message);

          if (!output) {
            debug('client response. output not present');
            //  If the response is JSON then return it as-is.
            var json = _.isObject(body) ? body : tryJSONparse(body);
            if (json) {
              return callback(null, response, json);
            }
          }
          //Reaches here for Fault processing as well since Fault is thrown as an error in xmlHandler.xmlToJson(..) function.
          error.response = response;
          error.body = body;
          self.emit('soapError', error);
          return callback(error, response, body);
        }

        if (!output || !obj.Body) {
          // for issue 671
          // one-way, no output expected
          return callback(null, null, body, obj.Header);
        }
        if (typeof obj.Body !== 'object') {
          var error = new Error(g.f('Cannot parse response'));
          error.response = response;
          error.body = body;
          return callback(error, obj, body);
        }

        var outputBodyDescriptor = operationDescriptor.output.body;
        var outputHeadersDescriptor = operationDescriptor.output.headers;

        if (outputBodyDescriptor.elements.length) {
          result = obj.Body[outputBodyDescriptor.elements[0].qname.name];
        }
        // RPC/literal response body may contain elements with added suffixes I.E.
        // 'Response', or 'Output', or 'Out'
        // This doesn't necessarily equal the ouput message name. See WSDL 1.1 Section 2.4.5
        if (!result) {
          var outputName = output.$name &&
            output.$name.replace(/(?:Out(?:put)?|Response)$/, '');
          result = obj.Body[outputName];
        }
        if (!result) {
          ['Response', 'Out', 'Output', '.Response', '.Out', '.Output'].forEach(function(term) {
            if (obj.Body.hasOwnProperty(name + term)) {
              return result = obj.Body[name + term];
            }
          });
        }
        debug('client response. result: %j body: %j obj.Header: %j', result, body, obj.Header);

        callback(null, result, body, obj.Header);
      }
    }, headers, options, self);

    // Added mostly for testability, but possibly useful for debugging
    if (req != null) {
      self.lastRequestHeaders = req.headers;
    }
    debug('client response. lastRequestHeaders: %j', self.lastRequestHeaders);
  }
}

module.exports = Client;
