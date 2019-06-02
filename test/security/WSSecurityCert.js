// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs'),
  join = require('path').join;
var XMLHandler = require('../../lib/parser/xmlHandler');

describe('WSSecurityCert', function() {
  var WSSecurityCert = require('../../').WSSecurityCert;
  var cert = fs.readFileSync(join(__dirname, '..', 'certs', 'agent2-cert.pem'));
  var key = fs.readFileSync(join(__dirname, '..', 'certs', 'agent2-key.pem'));

  it('is a function', function() {
    WSSecurityCert.should.be.type('function');
  });

  it('should accept valid constructor variables', function() {
    if(process.platform === 'win32'){
      return true;
    }
    var instance = new WSSecurityCert(key, cert, '');
    instance.should.have.property('privateKey');
    instance.should.have.property('publicP12PEM');
    instance.should.have.property('signer');
    instance.should.have.property('x509Id');
  });

  it('should not accept invalid constructor variables', function() {
    if(process.platform === 'win32'){
      return true;
    }
    var passed = true;

    try {
      new WSSecurityCert('*****', cert, '');
    } catch(e) {
      passed = false;
    }

    if (passed) {
      throw new Error('bad private key');
    }

    passed = true;
  });

  it('should insert a WSSecurity signing block when postProcess is called',
    function() {
    if(process.platform === 'win32'){
      return true;
    }
    var instance = new WSSecurityCert(key, cert, '');
    var env = XMLHandler.createSOAPEnvelope();
    instance.postProcess(env.header, env.body);
    var xml = env.header.toString({pretty: false});

    var sigDoc = XMLHandler.parseXml(null, instance.signer.getSignatureXml());
    var sigXML = sigDoc.toString({pretty: false});
    xml.should.containEql('<wsse:Security');
    xml.should.containEql('http://docs.oasis-open.org/wss/2004/01/' +
      'oasis-200401-wss-wssecurity-secext-1.0.xsd');
    xml.should.containEql('http://docs.oasis-open.org/wss/2004/01/' +
      'oasis-200401-wss-wssecurity-utility-1.0.xsd');
    xml.should.containEql('soap:mustUnderstand="1"');
    xml.should.containEql('<wsse:BinarySecurityToken');
    xml.should.containEql('EncodingType="http://docs.oasis-open.org/wss/2004/' +
      '01/oasis-200401-wss-soap-message-security-1.0#Base64Binary');
    xml.should.containEql('ValueType="http://docs.oasis-open.org/wss/2004/01/' +
      'oasis-200401-wss-x509-token-profile-1.0#X509v3"');
    xml.should.containEql('wsu:Id="' + instance.x509Id);
    xml.should.containEql('</wsse:BinarySecurityToken>');
    xml.should.containEql('<wsu:Timestamp wsu:Id="_1">');
    xml.should.containEql('<wsu:Created>' + instance.created);
    xml.should.containEql('<wsu:Expires>' + instance.expires);
    xml.should.containEql('<Signature ' +
      'xmlns="http://www.w3.org/2000/09/xmldsig#">');
    xml.should.containEql('<wsse:SecurityTokenReference');
    xml.should.containEql('<wsse:Reference URI="' + instance.x509Id);
    xml.should.containEql('ValueType="http://docs.oasis-open.org/wss/2004/01/' +
      'oasis-200401-wss-x509-token-profile-1.0#X509v3"/>');
    xml.should.containEql(instance.publicP12PEM);
    xml.should.containEql(sigXML);
  });
});
