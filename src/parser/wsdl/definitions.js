var _ = require('lodash');
var WSDLElement = require('./wsdlElement');
var Schema = require('../xsd/schema');
var Types = require('./types');
var Message = require('./message');
var PortType = require('./portType');
var Binding = require('./binding');
var Service = require('./service');
var Documentation = require('./documentation');

class Definitions extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.messages = {};
    this.portTypes = {};
    this.bindings = {};
    this.services = {};
    this.schemas = {};
  }

  addChild(child) {
    var self = this;
    if (child instanceof Types) {
      // Merge types.schemas into definitions.schemas
      _.merge(self.schemas, child.schemas);
    }
    else if (child instanceof Message) {
      self.messages[child.$name] = child;
    }
    else if (child.name === 'import') {
      self.schemas[child.$namespace] = new Schema(child.$namespace, {});
      self.schemas[child.$namespace].addChild(child);
    }
    else if (child instanceof PortType) {
      self.portTypes[child.$name] = child;
    }
    else if (child instanceof Binding) {
      if (child.transport === 'http://schemas.xmlsoap.org/soap/http' ||
        child.transport === 'http://www.w3.org/2003/05/soap/bindings/HTTP/')
        self.bindings[child.$name] = child;
    }
    else if (child instanceof Service) {
      self.services[child.$name] = child;
    }
    else if (child instanceof Documentation) {
    }
  }
}

Definitions.elementName = 'definitions';
Definitions.allowedChildren = ['types', 'message', 'portType', 'binding',
  'service', 'import', 'documentation', 'import', 'any'];

module.exports = Definitions;
