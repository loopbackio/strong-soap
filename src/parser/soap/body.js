'use strict';

var SOAPElement = require('./soapElement');
var helper = require('../helper');

/**
 * <soap:body parts="nmtokens"? use="literal|encoded"?
 * encodingStyle="uri-list"? namespace="uri"?>
 */
class Body extends SOAPElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Body.elementName = 'body';
Body.allowedChildren = ['documentation'];

module.exports = Body;
