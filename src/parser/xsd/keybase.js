var XSDElement = require('./xsdElement');

class KeyBase extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.selector = null;
    this.fields = [];
  }

  addChild(child) {
    if (child.name === 'selector') {
      if (this.selector) {
        console.warn(
          'The key element %s %s MUST contain one and only one selector element',
          this.nsName, this.$name);
      }
      this.selector = child.$xpath;
    } else if (child.name === 'field') {
      this.fields.push(child.$xpath);
    }
  }

  postProcess(definitions) {
    if (!this.selector) {
      console.warn(
        'The key element %s %s MUST contain one and only one selector element',
        this.nsName, this.$name);
    }
    if (!this.fields.length) {
      console.warn(
        'The key element %s %s MUST contain one or more field elements',
        this.nsName, this.$name);
    }
  }
}

KeyBase.allowedChildren = ['annotation', 'selector', 'field'];

module.exports = KeyBase;
