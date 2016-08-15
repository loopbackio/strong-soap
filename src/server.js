/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

'use strict';

var url = require('url'),
  compress = null,
  events = require('events'),
  XMLHandler = require('./parser/xmlHandler'),
  Base = require('./base'),
  toXMLDate = require('./utils').toXMLDate,
  util = require('util');

try {
  compress = require('compress');
} catch (error) {
  // Ignore error
}

class Server extends Base {

  constructor(server, path, services, wsdl, options) {
    super(wsdl, options);
    var self = this;

    options = options || {};
    this.path = path;
    this.services = services;
    this.xmlHandler = new XMLHandler(this.wsdl.options);

    if (path[path.length - 1] !== '/')
      path += '/';
    wsdl.load(function(err) {
      var listeners = server.listeners('request').slice();

      server.removeAllListeners('request');
      server.addListener('request', function(req, res) {
        if (typeof self.authorizeConnection === 'function') {
          if (!self.authorizeConnection(req.connection.remoteAddress)) {
            res.end();
            return;
          }
        }
        var reqPath = url.parse(req.url).pathname;
        if (reqPath[reqPath.length - 1] !== '/')
          reqPath += '/';
        if (path === reqPath) {
          self._requestListener(req, res);
        } else {
          for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i].call(this, req, res);
          }
        }
      });
    });
  }

  _requestListener(req, res) {
    var self = this;
    var reqParse = url.parse(req.url);
    var reqPath = reqParse.pathname;
    var reqQuery = reqParse.search;

    if (typeof self.log === 'function') {
      self.log('info', 'Handling ' + req.method + ' on ' + req.url);
    }

    if (req.method === 'GET') {
      if (reqQuery && reqQuery.toLowerCase() === '?wsdl') {
        if (typeof self.log === 'function') {
          self.log('info', 'Wants the WSDL');
        }
        res.setHeader('Content-Type', 'application/xml');
        res.write(self.wsdl.toXML());
      }
      res.end();
    } else if (req.method === 'POST') {
      res.setHeader('Content-Type', req.headers['content-type']);
      var chunks = [], gunzip;
      if (compress && req.headers['content-encoding'] === 'gzip') {
        gunzip = new compress.Gunzip();
        gunzip.init();
      }
      req.on('data', function(chunk) {
        if (gunzip)
          chunk = gunzip.inflate(chunk, 'binary');
        chunks.push(chunk);
      });
      req.on('end', function() {
        var xml = chunks.join('');
        var result;
        var error;
        if (gunzip) {
          gunzip.end();
          gunzip = null;
        }
        try {
          if (typeof self.log === 'function') {
            self.log('received', xml);
          }
          self._process(xml, req, function(result, statusCode) {
            if (statusCode) {
              res.statusCode = statusCode;
            }
            res.write(result);
            res.end();
            if (typeof self.log === 'function') {
              self.log('replied', result);
            }
          });
        }
        catch (err) {
          error = err.stack || err;
          res.statusCode = 500;
          res.write(error);
          res.end();
          if (typeof self.log === 'function') {
            self.log('error', error);
          }
        }
      });
    }
    else {
      res.end();
    }
  };

  _process(input, req, callback) {
    var self = this,
      pathname = url.parse(req.url).pathname.replace(/\/$/, ''),
      obj = this.xmlHandler.xmlToJson(null, input),
      body = obj.Body,
      headers = obj.Header,
      bindings = this.wsdl.definitions.bindings, binding,
      operation, operationName,
      serviceName, portName,
      includeTimestamp = obj.Header && obj.Header.Security &&
        obj.Header.Security.Timestamp;

    if (typeof self.authenticate === 'function') {
      if (!obj.Header || !obj.Header.Security) {
        throw new Error('No security header');
      }
      if (!self.authenticate(obj.Header.Security)) {
        throw new Error('Invalid username or password');
      }
    }

    if (typeof self.log === 'function') {
      self.log('info', 'Attempting to bind to ' + pathname);
    }

    // use port.location and current url to find the right binding
    binding = (function(self) {
      var services = self.wsdl.definitions.services;
      var firstPort;
      var name;
      for (name in services) {
        serviceName = name;
        var service = services[serviceName];
        var ports = service.ports;
        for (name in ports) {
          portName = name;
          var port = ports[portName];
          var portPathname = url.parse(port.location).pathname.replace(/\/$/, '');

          if (typeof self.log === 'function') {
            self.log('info', 'Trying ' + portName + ' from path ' + portPathname);
          }

          if (portPathname === pathname)
            return port.binding;

          // The port path is almost always wrong for generated WSDLs
          if (!firstPort) {
            firstPort = port;
          }
        }
      }
      return !firstPort ? void 0 : firstPort.binding;
    })(this);

    if (!binding) {
      throw new Error('Failed to bind to WSDL');
    }

    try {
      if (binding.style === 'rpc') {
        operationName = Object.keys(body)[0];

        self.emit('request', obj, operationName);
        if (headers)
          self.emit('headers', headers, operationName);

        self._executeMethod({
          serviceName: serviceName,
          portName: portName,
          operationName: operationName,
          outputName: operationName + 'Response',
          args: body[operationName],
          headers: headers,
          style: 'rpc'
        }, req, callback);
      } else {
        var messageElemName = (Object.keys(body)[0] === 'attributes' ?
          Object.keys(body)[1] : Object.keys(body)[0]);
        var pair = binding.topElements[messageElemName];

        var operationName, outputName;

        var operations = binding.operations;
        for (var name in operations) {
          if(operations[name].input.message.parts.body.element.$name === messageElemName) {
            operationName = operations[name].$name;
            outputName = operations[name].output.message.parts.body.element.$name;
            break;
          }
        }

        console.log(operationName);
        self.emit('request', obj, operationName);
        if (headers)
          self.emit('headers', headers, operationName);

        self._executeMethod({
          serviceName: serviceName,
          portName: portName,
          operationName: operationName,
          outputName: outputName,
          args: body[messageElemName],
          headers: headers,
          style: 'document',
          includeTimestamp: includeTimestamp
        }, req, callback);
      }
    } catch (error) {
      if (error.Fault !== undefined) {
        return self._sendError(error.Fault, callback, includeTimestamp);
      }

      throw error;
    }
  };

  _executeMethod(options, req, callback) {
    options = options || {};
    var self = this,
      operation, body,
      serviceName = options.serviceName,
      portName = options.portName,
      operationName = options.operationName,
      outputName = options.outputName,
      args = options.args,
      style = options.style,
      includeTimestamp = options.includeTimestamp,
      handled = false;

    try {
      operation = this.services[serviceName][portName][operationName];
    } catch (error) {
      return callback(this._envelope('', includeTimestamp));
    }

    function handleResult(error, result) {
      if (handled)
        return;
      handled = true;

      if (error && error.Fault !== undefined) {
        return self._sendError(error.Fault, callback, includeTimestamp);
      }
      else if (result === undefined) {
        // Backward compatibility to support one argument callback style
        result = error;
      }


      if (style === 'rpc') {
        //[rashmi] this needs a fix, calling non existent api
        var env = XMLHandler.createSOAPEnvelope();
        body = self.wsdl.objectToRpcXML(outputName, result, '', self.wsdl.definitions.$targetNamespace);
      } else {

        var operation  = self.wsdl.definitions.services[serviceName]
          .ports[portName].binding.operations[operationName];
        var element = operation.output;
        //  self.wsdl.objectToDocumentXML(outputName, result, element.targetNSAlias, element.targetNamespace);

        var operationDescriptor = operation.describe(self.wsdl.definitions);
        var outputBodyDescriptor = operationDescriptor.output.body;

        var soapNsURI = 'http://schemas.xmlsoap.org/soap/envelope/';
        var soapNsPrefix = self.wsdl.options.envelopeKey || 'soap';

        if (self.wsdl.options.forceSoap12Headers) {
          headers['Content-Type'] = 'application/soap+xml; charset=utf-8';
          soapNsURI = 'http://www.w3.org/2003/05/soap-envelope';
        }

        var nsContext = self.createNamespaceContext(soapNsPrefix, soapNsURI);
        var envelope = XMLHandler.createSOAPEnvelope(soapNsPrefix, soapNsURI);

        self.xmlHandler.jsonToXml(envelope.body, nsContext, outputBodyDescriptor, result);

        var message = envelope.body.toString({pretty: true});
        var xml = envelope.doc.end({pretty: true});

      }
      //callback(self._envelope(envelope, includeTimestamp));
      callback(xml);

    }

    if (!self.wsdl.definitions.services[serviceName].ports[portName]
        .binding.operations[operationName].output) {
      // no output defined = one-way operation so return empty response
      handled = true;
      callback('');
    }

    var result = operation(args, handleResult, options.headers, req);
    if (typeof result !== 'undefined') {
      handleResult(result);
    }
  };

  _addWSSecurityHeader(headerElemnet) {
    var secElement = headerElement.element('wsse:Security')
      .attribute('soap:mustUnderstand', '1');

    secElement
      .attribute('xmlns:wsse', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-secext-1.0.xsd')
      .attribute('xmlns:wsu', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-utility-1.0.xsd');

    var now = new Date();
    var created = toXMLDate(now);
    var timeStampXml = '';
    if (this._hasTimeStamp) {
      var expires = toXMLDate(new Date(now.getTime() + (1000 * 600)));

      var tsElement = secElement.element('wsu:Timestamp')
        .attribute('wsu:Id', 'Timestamp-' + created);
      tsElement.element('wsu:Created', created);
      tsElement.element('wsu:Expires', expires);
    }
  }

  _envelope(env, includeTimestamp) {
    env = env || XMLHandler.createSOAPEnvelope();

    if (includeTimestamp) {
      this._addWSSecurityHeader(env.header);
    }

    if (this.soapHeaders) {
      for (var i = 0, n = this.soapHeaders.length; i < n; i++) {
        var header = this.soapHeaders[i];
        env.header.element(header);
      }
    }

    return env;
  };

  _sendError(soapFault, callback, includeTimestamp) {
    var self = this,
      fault;

    var statusCode;
    if (soapFault.statusCode) {
      statusCode = soapFault.statusCode;
      soapFault.statusCode = undefined;
    }

    var env = XMLHandler.createSOAPEnvelope();
    if (soapFault.faultcode) {
      // Soap 1.1 error style
      // Root element will be prependend with the soap NS
      // It must match the NS defined in the Envelope (set by the _envelope method)
      this.xmlHandler.jsonToXml(env.body, null, null, 'soap:Fault', soapFault);
    }
    else {
      // Soap 1.2 error style.
      // 3rd param is the NS prepended to all elements
      // It must match the NS defined in the Envelope (set by the _envelope method)
      this.xmlHandler.jsonToXml(env.body, null, null, 'Fault', soapFault);
    }

    return callback(self._envelope(fault, includeTimestamp), statusCode);
  }
}

module.exports = Server;
