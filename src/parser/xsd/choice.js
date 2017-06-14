'use strict';

var XSDElement = require('./xsdElement');

class Choice extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Choice.elementName = 'choice';
Choice.allowedChildren = ['annotation', 'element', 'group', 'sequence',
  'choice', 'any'];

module.exports = Choice;
