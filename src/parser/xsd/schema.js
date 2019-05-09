// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var assert = require('assert');
var XSDElement = require('./xsdElement');
var helper = require('./../helper');
var Set = helper.Set;

class Schema extends XSDElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.complexTypes = {}; // complex types
    this.simpleTypes = {}; // simple types
    this.elements = {}; // elements
    this.includes = []; // included or imported schemas
    this.groups = {};
    this.attributes = {};
    this.attributeGroups = {};
  }

  merge(source, isInclude) {
    if (source === this) return this;
    assert(source instanceof Schema);
    if (this.$targetNamespace === source.$targetNamespace ||
      // xsd:include allows the target schema that does not have targetNamespace
      (isInclude && source.$targetNamespace === undefined)) {
      _.merge(this.complexTypes, source.complexTypes);
      _.merge(this.simpleTypes, source.simpleTypes);
      _.merge(this.elements, source.elements);
      _.merge(this.groups, source.groups);
      _.merge(this.attributes, source.attributes);
      _.merge(this.attributeGroups, source.attributeGroups);
      _.merge(this.xmlns, source.xmlns);
      if (Array.isArray(source.includes)) {
        this.includes = _.uniq(this.includes.concat(source.includes));
      }
    }
    return this;
  }

  addChild(child) {
    var name = child.$name;
    if (child.getTargetNamespace() === helper.namespaces.xsd &&
      name in helper.schemaTypes)
      return;
    switch (child.name) {
      case 'include':
      case 'import':
        var location = child.$schemaLocation || child.$location;
        if (location) {
          this.includes.push({
            namespace: child.$namespace || child.$targetNamespace
            || this.$targetNamespace,
            location: location,
            type: child.name // include or import
          });
        }
        break;
      case 'complexType':
        this.complexTypes[name] = child;
        break;
      case 'simpleType':
        this.simpleTypes[name] = child;
        break;
      case 'element':
        this.elements[name] = child;
        break;
      case 'group':
        this.groups[name] = child;
        break;
      case 'attribute':
        this.attributes[name] = child;
        break;
      case 'attributeGroup':
        this.attributeGroups[name] = child;
        break;
    }
  }

  postProcess(defintions) {
    var visited = new Set();
    visited.add(this);
    this.children.forEach(function(c) {
      visitDfs(defintions, visited, c);
    });
  }
}

function visitDfs(defintions, nodes, node) {
  let visited = nodes.has(node);
  if (!visited && !node._processed) {
    node.postProcess(defintions);
    node._processed = true;

    node.children.forEach(function(child) {
      visitDfs(defintions, nodes, child);
    });
  }
}

Schema.elementName = 'schema';
Schema.allowedChildren = ['annotation', 'element', 'complexType', 'simpleType',
  'include', 'import', 'group', 'attribute', 'attributeGroup'];

module.exports = Schema;
