'use strict';

var KeyBase = require('./keybase');

class Unique extends KeyBase {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Unique.elementName = 'unique';

module.exports = Unique;
