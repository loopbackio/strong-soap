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
