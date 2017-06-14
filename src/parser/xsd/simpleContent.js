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
