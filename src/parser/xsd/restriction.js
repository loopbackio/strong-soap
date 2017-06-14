'use strict';

var XSDElement = require('./xsdElement');
var Sequence = require('./sequence');
var Choice = require('./choice');
var QName = require('../qname');

class Restriction extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  addChild(child) {
    /*
     * simpleType: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
     *             totalDigits|fractionDigits|length|minLength|maxLength|
     *             enumeration|whiteSpace|pattern
     * simpleContent: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
     *                totalDigits|fractionDigits|length|minLength|maxLength|
     *                enumeration|whiteSpace|pattern|
     *                attribute|attributeGroup
     * complexContent: @base|minExclusive|minInclusive|maxExclusive|maxInclusive|
     *                 totalDigits|fractionDigits|length|minLength|maxLength|
     *                 enumeration|whiteSpace|pattern|
     *                 group|all|choice|sequence|
     *                 attribute|attributeGroup
     */
    switch (child.name) {
      case 'minExclusive':
      case 'minInclusive':
      case 'maxExclusive':
      case 'maxInclusive':
      case 'totalDigits':
      case 'fractionDigits':
      case 'length':
      case 'minLength':
      case 'maxLength':
      case 'whiteSpace':
      case 'pattern':
        this[child.name] = child.$value;
        break;
      case 'enumeration':
        this[child.name] = this[child.name] || [];
        this[child.name].push(child.$value);
        break;
    }
    if (this.parent.elementName === 'simpleContent') {
      //
    } else if (this.parent.elementName === 'complexContent') {
      //
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = this.descriptor =
      new XSDElement.TypeDescriptor();
    if (this.base) {
      descriptor.add(this.base.describe(definitions));
    }
    return this.describeChildren(definitions, descriptor);
  }

  postProcess(defintions) {
    if(this.base) return;
    var schemas = defintions.schemas;
    if (this.$base) {
      if (this.parent.name === 'simpleContent' ||
        this.parent.name === 'simpleType') {
        this.base = this.resolveSchemaObject(schemas, 'simpleType', this.$base);
      } else if (this.parent.name === 'complexContent') {
        this.base = this.resolveSchemaObject(schemas, 'complexType', this.$base);
        //
      }
    }
    if(this.base) {
      this.base.postProcess(defintions);
    }
  }
}

Restriction.elementName = 'restriction';
Restriction.allowedChildren = ['annotation', 'minExclusive', 'minInclusive',
  'maxExclusive', 'maxInclusive', 'totalDigits', 'fractionDigits', 'length',
  'minLength', 'maxLength', 'enumeration', 'whiteSpace', 'pattern',
  'group', 'all', 'choice', 'sequence', 'attribute', 'attributeGroup'];

module.exports = Restriction;
