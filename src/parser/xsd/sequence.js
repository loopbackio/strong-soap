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
