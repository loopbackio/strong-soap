'use strict';

var Parameter = require('./parameter');

class Input extends Parameter {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Input.elementName = 'input';

module.exports = Input;
