// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');
var Any = require('./any');

class Sequence extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Sequence.elementName = 'sequence';
Sequence.allowedChildren = ['annotation', 'element', 'group', 'sequence',
  'choice', 'any'];

module.exports = Sequence;
