// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');
var Sequence = require('./sequence');
var Choice = require('./choice');
var QName = require('../qname');
var g = require('../../globalize');

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

  _getFractionDigitCount(val) {
    var lastDotPos = val.lastIndexOf('.');
    if (lastDotPos !== -1) {
      return val.length - 1 - lastDotPos;
    }

    return 0;
  }

  _getTotalDigitCount(val) {
    var stripped = val.replace('-', '').replace('.', '').trim();
    return stripped.length;
  }

  enforce(val) {
    var violations = [];

    if (this.base) {
      if (this.base.jsType === Boolean) {
        val = val === 'true' || val === true;
      } else if (typeof this.base.jsType === 'function' && this.base.jsType !== Date && this.base.jsType !== Number) {
        val = this.base.jsType(val);
      }

      if(this.base.jsType === Number) {
        if(isNaN(val)){
          violations.push('value is not a number (' + val + ')');
        }
      }
    }

    if (this.minExclusive !== undefined) {
      if (val <= this.minExclusive) {
        violations.push('value is less or equal than minExclusive (' + val + ' <= ' + this.minExclusive + ')');
      }
    }

    if (this.minInclusive !== undefined) {
      if (val < this.minInclusive) {
        violations.push('value is less than minInclusive (' + val + ' < ' + this.minInclusive + ')');
      }
    }

    if (this.maxExclusive !== undefined) {
      if (val >= this.maxExclusive) {
        violations.push('value is greater or equal than maxExclusive (' + val + ' >= ' + this.maxExclusive + ')');
      }
    }

    if (this.maxInclusive !== undefined) {
      if (val > this.maxInclusive) {
        violations.push('value is greater than maxInclusive (' + val + ' > ' + this.maxInclusive + ')');
      }
    }

    if (this.fractionDigits !== undefined) {
      if (typeof val === 'string') {
        var fractionDigitCount = this._getFractionDigitCount(val);
        if (fractionDigitCount > this.fractionDigits) {
          violations.push('value has more decimal places than allowed (' + fractionDigitCount + ' > ' + this.fractionDigits + ')');
        }
      } else if (typeof val === 'number') {
        val = val.toFixed(this.fractionDigits);
      }
    }

    if (this.totalDigits !== undefined) {
      if (typeof val === 'string') {
        var totalDigits = this._getTotalDigitCount(val);
        if (totalDigits > this.totalDigits) {
          violations.push('value has more digits than allowed (' + totalDigits + ' > ' + this.totalDigits + ')');
        }
      } else if (typeof val === 'number') {
        var integerDigits = parseInt(val).toString().replace('-', '').length;
        if (integerDigits > this.totalDigits) {
          violations.push('value has more integer digits than allowed (' + integerDigits + ' > ' + this.totalDigits + ')');
        } else {
          val = val.toFixed(this.totalDigits - integerDigits);
        }
      }
    }

    if (this.length !== undefined) {
      if (val.length !== parseInt(this.length)) {
        violations.push('lengths don\'t match (' + val.length + ' != ' + this.length + ')');
      }
    }

    if (this.maxLength !== undefined) {
      if (val.length > this.maxLength) {
        violations.push('length is bigger than maxLength (' + val.length + ' > ' + this.maxLength + ')');
      }
    }

    if (this.minLength !== undefined) {
      if (val.length < this.minLength) {
        violations.push('length is smaller than minLength (' + val.length + ' < ' + this.minLength + ')');
      }
    }

    if (this.whiteSpace === 'replace') {
      val = val.replace(/[\n\r\t]/mg, ' ');
    } else if (this.whiteSpace === 'collapse') {
      val = val.replace(/[\n\r\t]/mg, ' ').replace(/[ ]+/mg, ' ').trim();
    }

    if (this.pattern) {
      if (!new RegExp(this.pattern).test(val)) {
        violations.push('value doesn\'t match the required pattern (' + val + ' !match ' + this.pattern + ')');
      }
    }

    if (this.enumeration) {
      if (this.enumeration.indexOf(val) === -1) {
        violations.push('value is not in the list of valid values (' + val + ' is not in ' + this.enumeration + ')');
      }
    }

    if (violations.length > 0) {
      throw new Error(g.f('The field %s cannot have value %s due to the violations: %s', this.parent.$name, val, JSON.stringify(violations)));
    }

    return val;
  }
}

Restriction.elementName = 'restriction';
Restriction.allowedChildren = ['annotation', 'minExclusive', 'minInclusive',
  'maxExclusive', 'maxInclusive', 'totalDigits', 'fractionDigits', 'length',
  'minLength', 'maxLength', 'enumeration', 'whiteSpace', 'pattern',
  'group', 'all', 'choice', 'sequence', 'attribute', 'attributeGroup'];

module.exports = Restriction;
