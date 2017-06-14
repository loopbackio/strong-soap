'use strict';

var XSDElement = require('./xsdElement');

class Annotation extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }
}

Annotation.elementName = 'annotation';
Annotation.allowedChildren = ['documentation', 'appinfo'];

module.exports = Annotation;
