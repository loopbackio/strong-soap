var XSDElement = require('./xsdElement');
var helper = require('../helper');
var extend = helper.extend;
var Sequence = require('./sequence');
var Choice = require('./choice');
var QName = require('../qname');

class Extension extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
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
    var schemas = defintions.schemas;
    if (this.$base) {
      this.base = this.resolveSchemaObject(schemas, 'type', this.$base);
    }
  }
}

Extension.elementName = 'extension';
Extension.allowedChildren = ['annotation', 'group', 'all', 'sequence',
  'choice', 'attribute', 'attributeGroup'];

module.exports = Extension;
