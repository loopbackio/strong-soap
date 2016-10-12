'use strict';

var _ = require('lodash');
var Security = require('./security');

class NTLMSecurity extends Security {
  constructor(username, password, domain, workstation, options) {
    super(options);
    this.username = username;
    this.password = password;
    this.domain = domain;
    this.workstation = workstation;
  }

  addOptions(options) {
    options.username = this.username;
    options.password = this.password;
    options.domain = this.domain;
    options.workstation = this.workstation;
    _.merge(options, this.options);
  }
}


module.exports = NTLMSecurity;
