// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');

class Any extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Any.elementName = 'any';

module.exports = Any;
