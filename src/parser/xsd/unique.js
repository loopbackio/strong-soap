// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var KeyBase = require('./keybase');

class Unique extends KeyBase {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Unique.elementName = 'unique';

module.exports = Unique;
