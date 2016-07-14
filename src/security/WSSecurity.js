"use strict";

var Security = require('./security');
var crypto = require('crypto');
var passwordDigest = require('../utils').passwordDigest;
var validPasswordTypes = ['PasswordDigest', 'PasswordText'];
var toXMLDate = require('../utils').toXMLDate;

class WSSecurity extends Security {
  constructor(username, password, options) {
    options = options || {};
    super(options);
    this._username = username;
    this._password = password;
    //must account for backward compatibility for passwordType String param as 
    // well as object options defaults: passwordType = 'PasswordText', 
    // hasTimeStamp = true   
    if (typeof options === 'string') {
      this._passwordType = options ? options : 'PasswordText';
      options = {};
    } else {
      this._passwordType = options.passwordType ? options.passwordType :
        'PasswordText';
    }

    if (validPasswordTypes.indexOf(this._passwordType) === -1) {
      this._passwordType = 'PasswordText';
    }

    this._hasTimeStamp = options.hasTimeStamp ||
    typeof options.hasTimeStamp === 'boolean' ? !!options.hasTimeStamp : true;
    this._hasTokenCreated = options.hasTokenCreated ||
    typeof options.hasTokenCreated === 'boolean' ?
      !!options.hasTokenCreated : true;

    /*jshint eqnull:true */
    if (options.hasNonce != null) {
      this._hasNonce = !!options.hasNonce;
    }
    this._hasTokenCreated = options.hasTokenCreated ||
    typeof options.hasTokenCreated === 'boolean' ?
      !!options.hasTokenCreated : true;
    if (options.actor != null) {
      this._actor = options.actor;
    }
    if (options.mustUnderstand != null) {
      this._mustUnderstand = !!options.mustUnderstand;
    }
  }

  addSoapHeaders(headerElement) {
    var secElement = headerElement.element('wsse:Security');
    if (this._actor) {
      secElement.attribute('soap:actor', this._actor);
    }
    if (this._mustUnderstand) {
      secElement.attribute('soap:mustUnderstand', '1');
    }

    secElement
      .attribute('xmlns:wsse', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-secext-1.0.xsd')
      .attribute('xmlns:wsu', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-utility-1.0.xsd');

    var now = new Date();
    var created = toXMLDate(now);
    var timeStampXml = '';
    if (this._hasTimeStamp) {
      var expires = toXMLDate(new Date(now.getTime() + (1000 * 600)));

      var tsElement = secElement.element('wsu:Timestamp')
        .attribute('wsu:Id', 'Timestamp-' + created);
      tsElement.element('wsu:Created', created);
      tsElement.element('wsu:Expires', expires);
    }

    var userNameElement = secElement.element('wsse:UsernameToken')
      .attribute('wsu:Id', 'SecurityToken-' + created);

    userNameElement.element('wsse:Username', this._username);
    if (this._hasTokenCreated) {
      userNameElement.element('wsu:Created', created);
    }

    var nonce;
    if(this._hasNonce || this._passwordType !== 'PasswordText') {
      // nonce = base64 ( sha1 ( created + random ) )
      var nHash = crypto.createHash('sha1');
      nHash.update(created + Math.random());
      nonce = nHash.digest('base64');
    }

    var password;
    if (this._passwordType === 'PasswordText') {
      userNameElement.element('wsse:Password')
        .attribute('Type', 'http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-username-token-profile-1.0#PasswordText')
        .text(this._password);

      if (nonce) {
        userNameElement.element('wsse:Nonce')
          .attribute('EncodingType', 'http://docs.oasis-open.org/wss/2004/01/' +
            'oasis-200401-wss-soap-message-security-1.0#Base64Binary')
          .text(nonce);
      }
    } else {
      userNameElement.element('wsse:Password')
        .attribute('Type', 'http://docs.oasis-open.org/wss/2004/01/' +
          'oasis-200401-wss-username-token-profile-1.0#PasswordDigest')
        .text(passwordDigest(nonce, created, this._password));

      userNameElement.element('wsse:Nonce')
        .attribute('EncodingType', 'http://docs.oasis-open.org/wss/2004/01/' +
          'oasis-200401-wss-soap-message-security-1.0#Base64Binary')
        .text(nonce);
    }

  }
}

module.exports = WSSecurity;
