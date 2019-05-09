// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var XSDElement = require('./xsdElement');
var helper = require('../helper');
var SimpleType = require('./simpleType');

class Union extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  postProcess(definitions) {
    if (this.memberTypes) return;
    var self = this;
    this.memberTypes = [];
    if (this.$memberTypes) {
      this.$memberTypes.split(/\s+/).filter(Boolean).forEach(
        function(typeQName) {
          var type = self.resolveSchemaObject(definitions.schemas,
            'simpleType', typeQName);
          self.memberTypes.push(type);
        });
    }
    this.children.forEach(function(c) {
      if (c instanceof SimpleType) {
        self.memberTypes.push(c);
      }
    });
  }
}

Union.elementName = 'union';
Union.allowedChildren = ['annotation', 'simpleType'];

module.exports = Union;
