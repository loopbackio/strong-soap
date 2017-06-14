'use strict';

var SOAPElement = require('./soapElement');
var helper = require('../helper');

/**
 * <soap:header message="qname" part="nmtoken" use="literal|encoded"
 * encodingStyle="uri-list"? namespace="uri"?>*
 *   <soap:headerfault message="qname" part="nmtoken" use="literal|encoded"
 *   encodingStyle="uri-list"? namespace="uri"?/>*
 * <soap:header>
 */
class Header extends SOAPElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.fault = null;
  }

  addChild(child) {
    if (child.name === 'headerfault') {
      this.fault = child;
    }
  }
}

Header.elementName = 'header';
Header.allowedChildren = ['documentation', 'headerFault'];

module.exports = Header;
