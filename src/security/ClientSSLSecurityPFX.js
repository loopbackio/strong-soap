'use strict';

var g = require('../globalize');
var fs = require('fs')
  , https = require('https')
  , _ = require('lodash')
  , Security = require('./security');

class ClientSSLSecurityPFX extends Security {

  /**
   * activates SSL for an already existing client using a PFX cert
   *
   * @module ClientSSLSecurityPFX
   * @param {Buffer|String}   pfx
   * @param {String}   passphrase
   * @constructor
   */
  constructor(pfx, passphrase, options) {
    super(options);

    if (typeof passphrase === 'object') {
      options = passphrase;
    }
    if (pfx) {
      if (Buffer.isBuffer(pfx)) {
        this.pfx = pfx;
      } else if (typeof pfx === 'string') {
        this.pfx = fs.readFileSync(pfx);
      } else {
        throw new Error(g.f(
          'supplied {{pfx}} file should be a {{buffer}} or a file location'));
      }
    }

    if (passphrase) {
      if (typeof passphrase === 'string') {
        this.passphrase = passphrase;
      }
    }
    this.options = {};
    _.merge(this.options, options);
  }

  addOptions(options) {
    options.pfx = this.pfx;
    if (this.passphrase) {
      options.passphrase = this.passphrase;
    }
    _.merge(options, this.options);
    options.agent = new https.Agent(options);
  }
}

module.exports = ClientSSLSecurityPFX;
