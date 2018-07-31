"use strict";

var Client = require('./client'),
  Server = require('./server'),
  HttpClient = require('./http'),
  security = require('./security'),
  passwordDigest = require('./utils').passwordDigest,
  parser = require('./parser/index'),
  openWSDL = parser.WSDL.open,
  debug = require('debug')('strong-soap:soap');

var _wsdlCache = {};

function _requestWSDL(url, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  _wsdlCache = options.WSDL_CACHE || _wsdlCache;

  var wsdl = _wsdlCache[url];
  if (wsdl) {
    debug('_requestWSDL, wsdl in cache %s', wsdl);
    process.nextTick(function() {
      callback(null, wsdl);
    });
  }
  else {
    openWSDL(url, options, function(err, wsdl) {
      if (err) {
        return callback(err);
      } else {
        _wsdlCache[url] = wsdl;
      }
      callback(null, wsdl);
    });
  }
}

function createClient(url, options, callback, endpoint) {
  if (typeof options === 'function') {
    endpoint = callback;
    callback = options;
    options = {};
  }
  endpoint = options.endpoint || endpoint;
  debug('createClient params: wsdl url: %s client options: %j', url, options);
  _requestWSDL(url, options, function(err, wsdl) {
    callback(err, wsdl && new Client(wsdl, endpoint, options));
  });
}

function listen(server, pathOrOptions, services, xml) {
  debug('listen params: pathOrOptions: %j services: %j xml: %j', pathOrOptions, services, xml);
  var options = {},
    path = pathOrOptions,
    uri = null;

  if (typeof pathOrOptions === 'object') {
    options = pathOrOptions;
    path = options.path;
    services = options.services;
    xml = options.xml;
    uri = options.uri;
  }

  var wsdl = new parser.WSDL(xml || services, uri, options);
  return new Server(server, path, services, wsdl, options);
}

exports.security = security;
exports.BasicAuthSecurity = security.BasicAuthSecurity;
exports.WSSecurity = security.WSSecurity;
exports.WSSecurityCert = security.WSSecurityCert;
exports.ClientSSLSecurity = security.ClientSSLSecurity;
exports.ClientSSLSecurityPFX = security.ClientSSLSecurityPFX;
exports.BearerSecurity = security.BearerSecurity;
exports.createClient = createClient;
exports.passwordDigest = passwordDigest;
exports.listen = listen;
exports.WSDL = parser.WSDL;
exports.XMLHandler = parser.XMLHandler;
exports.NamespaceContext = parser.NamespaceContext;
exports.QName = parser.QName;

// Export Client and Server to allow customization
exports.Server = Server;
exports.Client = Client;
exports.HttpClient = HttpClient;
