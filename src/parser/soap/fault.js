'use strict';

var SOAPElement = require('./soapElement');
var helper = require('../helper');

/**
 * <soap:fault name="nmtoken" use="literal|encoded" 
 * encodingStyle="uri-list"? namespace="uri"?>
 */
class Fault extends SOAPElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Fault.elementName = 'fault';
Fault.allowedChildren = ['documentation'];

module.exports = Fault;
