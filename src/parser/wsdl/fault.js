'use strict';

var Parameter = require('./parameter');

class Fault extends Parameter {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Fault.elementName = 'fault';
Fault.allowedChildren = ['documentation', 'fault'];

module.exports = Fault;
