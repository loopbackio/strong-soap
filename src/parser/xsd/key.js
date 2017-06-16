'use strict';

var KeyBase = require('./keybase');

class Key extends KeyBase {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Key.elementName = 'key';

module.exports = Key;
