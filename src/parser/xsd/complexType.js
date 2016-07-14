var XSDElement = require('./xsdElement');
var Choice = require('./choice');
var Sequence = require('./sequence');
var All = require('./all');
var SimpleContent = require('./simpleContent');
var ComplexContent = require('./complexContent');

class ComplexType extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var descriptor = this.descriptor =
      new XSDElement.TypeDescriptor();
    if (this.$mixed) {
      descriptor.mixed = true;
    }
    var children = this.children || [];
    var childDescriptor;
    for (var i = 0, child; child = children[i]; i++) {
      childDescriptor = child.describe(definitions);
      if (childDescriptor) {
        descriptor.add(childDescriptor);
      }
    }
    return descriptor;
  }
}

ComplexType.elementName = 'complexType';
ComplexType.allowedChildren = ['annotation', 'group', 'sequence', 'all',
  'complexContent', 'simpleContent', 'choice', 'attribute', 'attributeGroup',
  'anyAttribute'];

module.exports = ComplexType;
