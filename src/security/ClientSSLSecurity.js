'use strict';

var g = require('../globalize');
var fs = require('fs')
  , https = require('https')
  , _ = require('lodash')
  , Security = require('./security');

class ClientSSLSecurity extends Security {

  /**
   * activates SSL for an already existing client
   *
   * @module ClientSSLSecurity
   * @param {Buffer|String}   key
   * @param {Buffer|String}   cert
   * @param {Buffer|String|Array}   [ca]
   * @param {Object}          [options]
   * @constructor
   */
  constructor(key, cert, ca, options) {
    super(options);
    if (key) {
      if (Buffer.isBuffer(key)) {
        this.key = key;
      } else if (typeof key === 'string') {
        this.key = fs.readFileSync(key);
      } else {
        throw new Error(g.f('{{key}} should be a {{buffer}} or a {{string}}!'));
      }
    }

    if (cert) {
      if (Buffer.isBuffer(cert)) {
        this.cert = cert;
      } else if (typeof cert === 'string') {
        this.cert = fs.readFileSync(cert);
      } else {
        throw new Error(g.f('{{cert}} should be a {{buffer}} or a {{string}}!'));
      }
    }

    if (ca) {
      if (Buffer.isBuffer(ca) || Array.isArray(ca)) {
        this.ca = ca;
      } else if (typeof ca === 'string') {
        this.ca = fs.readFileSync(ca);
      } else {
        this.options = ca;
        this.ca = null;
      }
    }
  }

  addOptions(options) {
    options.key = this.key;
    options.cert = this.cert;
    options.ca = this.ca;
    _.merge(options, this.options);
    options.agent = new https.Agent(options);
  };
}

module.exports = ClientSSLSecurity;
