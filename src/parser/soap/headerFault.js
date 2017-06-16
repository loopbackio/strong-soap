'use strict';

var SOAPElement = require('./soapElement');
var helper = require('../helper');

/**
 * <soap:headerfault message="qname" part="nmtoken" use="literal|encoded"
 * encodingStyle="uri-list"? namespace="uri"?/>*
 */
class HeaderFault extends SOAPElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

HeaderFault.elementName = 'headerfault';
HeaderFault.allowedChildren = ['documentation'];

module.exports = HeaderFault;
