// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var Security = require('./security');

class NTLMSecurity extends Security {
  constructor(username, password, domain, workstation, wsdlAuthRequired, options) {
    super(options);
    this.username = username;
    this.password = password;
    this.domain = domain;
    this.workstation = workstation;
    //set this to true/false if remote WSDL retrieval needs NTLM authentication or not
    this.wsdlAuthRequired = wsdlAuthRequired;
  }

  addOptions(options) {
    options.username = this.username;
    options.password = this.password;
    options.domain = this.domain;
    options.workstation = this.workstation;
    options.wsdlAuthRequired = this.wsdlAuthRequired;
    _.merge(options, this.options);
  }
}


module.exports = NTLMSecurity;
