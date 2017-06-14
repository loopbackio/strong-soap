'use strict';

var Parameter = require('./parameter');

class Output extends Parameter {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Output.elementName = 'output';

module.exports = Output;
