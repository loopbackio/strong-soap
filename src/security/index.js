// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";

var WSSecurityCert;
try {
  WSSecurityCert = require('./WSSecurityCert');
} catch (err) {
  console.warn(err);
}

module.exports = {
  BasicAuthSecurity: require('./BasicAuthSecurity'),
  ClientSSLSecurity: require('./ClientSSLSecurity'),
  ClientSSLSecurityPFX: require('./ClientSSLSecurityPFX'),
  CookieSecurity: require('./CookieSecurity'),
  WSSecurity: require('./WSSecurity'),
  BearerSecurity: require('./BearerSecurity'),
  WSSecurityCert: WSSecurityCert,
  NTLMSecurity: require('./NTLMSecurity')
};
