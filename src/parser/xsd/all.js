'use strict';

var XSDElement = require('./xsdElement');

class All extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

All.elementName = 'all';
All.allowedChildren = ['annotation', 'element'];

module.exports = All;
