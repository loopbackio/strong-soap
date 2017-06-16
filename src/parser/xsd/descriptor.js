'use strict';

var assert = require('assert');
var QName = require('../qname');

/**
 * Descriptor for an XML attribute
 */
class AttributeDescriptor {
  constructor(qname, type, form) {
    assert(qname == null || qname instanceof QName, 'Invalid qname: ' + qname);
    this.qname = qname;
    this.type = type;
    form = form || 'qualified';
    assert(form === 'qualified' || form === 'unqualified',
      'Invalid form: ' + form);
    this.form = form;
  }
}

/**
 * Descriptor for an XML type
 */
class TypeDescriptor {
  constructor(qname) {
    this.elements = [];
    this.attributes = [];
  }

  addElement(element) {
    assert(element instanceof ElementDescriptor);
    this.elements.push(element);
    return element;
  }

  addAttribute(attribute) {
    assert(attribute instanceof AttributeDescriptor);
    this.attributes.push(attribute);
    return attribute;
  }

  add(item, isMany) {
    if (item instanceof ElementDescriptor) {
      this.addElement(item.clone(isMany));
    } else if (item instanceof AttributeDescriptor) {
      this.addAttribute(item);
    } else if (item instanceof TypeDescriptor) {
      var i, n;
      for (i = 0, n = item.elements.length; i < n; i++) {
        this.addElement(item.elements[i]);
      }
      for (i = 0, n = item.attributes.length; i < n; i++) {
        this.addAttribute(item.attributes[i]);
      }
      if (item.extension) {
          this.extension = item.extension;
      }
    }
  }

  findElement(name) {
    for (var i = 0, n = this.elements.length; i < n; i++) {
      if (this.elements[i].qname.name === name) {
        return this.elements[i];
      }
    }
    return null;
  }

  findAttribute(name) {
    for (var i = 0, n = this.attributes.length; i < n; i++) {
      if (this.attributes[i].qname.name === name) {
        return this.attributes[i];
      }
    }
    return null;
  }

  find(name) {
    var element = this.findElement(name);
    if (element) return element;
    var attribute = this.findAttribute(name);
    return attribute;
  }
}

/**
 * Descriptor for an XML element
 */
class ElementDescriptor extends TypeDescriptor {
  constructor(qname, type, form, isMany) {
    super();
    assert(qname == null || qname instanceof QName, 'Invalid qname: ' + qname);
    this.qname = qname;
    this.type = type;
    form = form || 'qualified';
    assert(form === 'qualified' || form === 'unqualified',
      'Invalid form: ' + form);
    this.form = form;
    this.isMany = !!isMany;
    this.isSimple = false;
  }

  clone(isMany) {
    // Check if the referencing element or this element has 'maxOccurs>1'
    isMany = (!!isMany) || this.isMany;
    var copy = new ElementDescriptor(this.qname, this.type, this.form, isMany);
    copy.isNillable = this.isNillable;
    copy.isSimple = this.isSimple;
    if (this.jsType) copy.jsType = this.jsType;
    if (this.elements != null) copy.elements = this.elements;
    if (this.attributes != null) copy.attributes = this.attributes;
    if (this.mixed != null) copy.mixed = this.mixed;
    copy.refOriginal = this;
    return copy;
  }
}

module.exports = {
  ElementDescriptor: ElementDescriptor,
  AttributeDescriptor: AttributeDescriptor,
  TypeDescriptor: TypeDescriptor
};

