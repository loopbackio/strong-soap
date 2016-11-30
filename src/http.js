'use strict';

var url = require('url');
var req = require('request');
var debug = require('debug')('st-soap:http');
var httpntlm = require('httpntlm');

var VERSION = require('../package.json').version;

/**
 * A class representing the http client
 * @param {Object} [options] Options object. It allows the customization of
 * `request` module
 *
 * @constructor
 */
class HttpClient {
  constructor(options) {
    this.options = options || {};
    this._request = options.request || req;
  }

  /**
   * Build the HTTP request (method, uri, headers, ...)
   * @param {String} rurl The resource url
   * @param {Object|String} data The payload
   * @param {Object} exheaders Extra http headers
   * @param {Object} exoptions Extra options
   * @returns {Object} The http request object for the `request` module
   */
  buildRequest(rurl, data, exheaders, exoptions) {
    var curl = url.parse(rurl);
    var secure = curl.protocol === 'https:';
    var host = curl.hostname;
    var port = parseInt(curl.port, 10);
    var path = [curl.pathname || '/', curl.search || '', curl.hash || ''].join('');
    var method = data ? 'POST' : 'GET';
    var headers = {
      'User-Agent': 'strong-soap/' + VERSION,
      'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'none',
      'Accept-Charset': 'utf-8',
      'Connection': 'close',
      'Host': host + (isNaN(port) ? '' : ':' + port)
    };
    var attr;
    var header;
    var mergeOptions = ['headers'];

    if (typeof data === 'string') {
      headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    exheaders = exheaders || {};
    for (attr in exheaders) {
      headers[attr] = exheaders[attr];
    }

    var options = {
      uri: curl,
      method: method,
      headers: headers,
      followAllRedirects: true
    };

    options.body = data;

    exoptions = exoptions || {};
    for (attr in exoptions) {
      if (mergeOptions.indexOf(attr) !== -1) {
        for (header in exoptions[attr]) {
          options[attr][header] = exoptions[attr][header];
        }
      } else {
        options[attr] = exoptions[attr];
      }
    }
    debug('Http request: %j', options);
    return options;
  }

  /**
   * Handle the http response
   * @param {Object} The req object
   * @param {Object} res The res object
   * @param {Object} body The http body
   * @param {Object} The parsed body
   */
  handleResponse(req, res, body) {
    debug('Http response body: %j', body);
    if (typeof body === 'string') {
      // Remove any extra characters that appear before or after the SOAP
      // envelope.
      var match = body.match(
        /(?:<\?[^?]*\?>[\s]*)?<([^:]*):Envelope([\S\s]*)<\/\1:Envelope>/i);
      if (match) {
        body = match[0];
      }
    }
    return body;
  }

  request(rurl, data, callback, exheaders, exoptions) {
    var self = this;
    var options = self.buildRequest(rurl, data, exheaders, exoptions);
    var headers = options.headers;
    var req;

    //typically clint.js would do addOptions() if security is set to get all security options added to options{}. But client.js
    //addoptions() code runs after this code is trying to contact server to load remote WSDL, hence we would NTLM authentication
    //object passed in as option to createClient( ) call for now. Revisit.
    var ntlmSecurity = this.options.NTLMSecurity;
    if (ntlmSecurity == null) {
      req = self._request(options, function (err, res, body) {
      if (err) {
        return callback(err);
      }
      body = self.handleResponse(req, res, body);
      callback(null, res, body);
    });
    } else {
      //NTLMSecurity code needs 'url' in options{} and it should be plain string, not parsed uri
      options.url = rurl;
      options.username = ntlmSecurity.username;
      options.password = ntlmSecurity.password;
      options.domain = ntlmSecurity.domain;
      options.workstation = ntlmSecurity.workstation;
      var method = options.method;
      req = httpntlm['method'](method, options, function (err, res, body) {
        if (err) {
          return callback(err);
        }
        body = self.handleResponse(req, res, body);
        callback(null, res, body);
      });
    }

    return req;
  }
}

module.exports = HttpClient;
