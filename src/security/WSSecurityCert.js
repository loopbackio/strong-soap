// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var NodeRsa = require('node-rsa');
var SignedXml = require('xml-crypto').SignedXml;
var uuid = require('uuid');
var Security = require('./security');
var xmlHandler = require('../parser/xmlHandler');

var crypto = require('crypto');

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function dateStringForSOAP(date) {
  return date.getUTCFullYear() + '-' +
    ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getUTCDate()).slice(-2) + 'T' +
    ('0' + date.getUTCHours()).slice(-2) + ":" +
    ('0' + date.getUTCMinutes()).slice(-2) + ":" +
    ('0' + date.getUTCSeconds()).slice(-2) + "Z";
}

function generateCreated() {
  return dateStringForSOAP(new Date());
}

function generateExpires() {
  return dateStringForSOAP(addMinutes(new Date(), 10));
}

function generateId() {
  return uuid.v4().replace(/-/gm, '');
}

class WSSecurityCert extends Security {
  constructor(privatePEM, publicP12PEM, password) {
    super();
    
    this.publicP12PEM = publicP12PEM.toString()
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/(\r\n|\n|\r)/gm, '');

    this.signer = new SignedXml();
    this.signer.signingKey = this.getSigningKey(privatePEM, password);
    this.x509Id = 'x509-' + generateId();

    var references = ['http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#'];

    this.signer.addReference('//*[local-name(.)=\'Body\']', references);
    this.signer.addReference('//*[local-name(.)=\'Timestamp\']', references);

    var _this = this;
    this.signer.keyInfoProvider = {};
    this.signer.keyInfoProvider.getKeyInfo = function(key) {
      var x509Id = _this.x509Id;
      var xml =
        `<wsse:SecurityTokenReference>
    <wsse:Reference URI="${x509Id}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/>
    </wsse:SecurityTokenReference>`;
      return xml;
    };
  }

  getSigningKey(privatePEM, password) {
    if (typeof crypto.createPrivateKey === 'function') {
      // Node 11 or above
      this.privateKey = crypto.createPrivateKey({key: privatePEM, passphrase: password});
      return this.privateKey.export({type: 'pkcs1', format: 'pem'});
    } else {
      // Node 10 or below, fall back to https://github.com/rzcoder/node-rsa
      if (password) throw new Error('Passphrase is not supported by node-rsa.');
      this.privateKey = new NodeRsa(privatePEM);
      return this.privateKey.exportKey('private');
    }
  }

  postProcess(headerElement, bodyElement) {
    this.created = generateCreated();
    this.expires = generateExpires();

    var binaryToken = this.publicP12PEM,
      created = this.created,
      expires = this.expires,
      id = this.x509Id;

    var secElement = headerElement.element('wsse:Security')
      .attribute('xmlns:wsse', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-secext-1.0.xsd')
      .attribute('xmlns:wsu', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-utility-1.0.xsd')
      .attribute('soap:mustUnderstand', '1');
    secElement.element('wsse:BinarySecurityToken')
      .attribute('EncodingType', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-soap-message-security-1.0#Base64Binary')
      .attribute('ValueType', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-x509-token-profile-1.0#X509v3')
      .attribute('wsu:Id', id)
      .text(binaryToken);
    var tsElement = secElement.element('wsu:Timestamp')
      .attribute('wsu:Id', '_1');
    tsElement.element('wsu:Created', created);
    tsElement.element('wsu:Expires', expires);

    var xmlWithSec = headerElement.doc().end({pretty: true});

    this.signer.computeSignature(xmlWithSec);
    var sig = this.signer.getSignatureXml();

    xmlHandler.parseXml(secElement, sig);
  }
}

module.exports = WSSecurityCert;
