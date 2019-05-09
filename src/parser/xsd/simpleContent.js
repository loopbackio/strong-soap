// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');
var Extension = require('./extension');

class SimpleContent extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

SimpleContent.elementName = 'simpleContent';
SimpleContent.allowedChildren = ['annotation', 'extension', 'restriction'];

module.exports = SimpleContent;
