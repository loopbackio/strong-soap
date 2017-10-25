'use strict';

var _ = require('lodash');
var WSDLElement = require('../wsdl/wsdlElement');
var Schema = require('../xsd/schema');
var Types = require('../wsdl/types');
var Message = require('../wsdl/message');
var PortType = require('../wsdl/portType');
var Binding = require('../wsdl/binding');
var Service = require('../wsdl/service');
var Documentation = require('../wsdl/documentation');

var Grammars = require('./grammars');
var Resources = require('./resources');
var Method = require('./method');

class Application extends WSDLElement {
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
    else if (child instanceof Grammars) {
      // Merge types.schemas into definitions.schemas
      _.merge(self.schemas, child.schemas);
    }
    else if (child instanceof Message) {
      self.messages[child.$name] = child;
    }
    else if (child.name === 'import') {
      //create a Schema element for the <import ../>. targetNamespace is the 'namespace' of the <import  />  element in the wsdl.
      self.schemas[child.$namespace] = new Schema('xs:schema',{targetNamespace: child.$namespace});
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
    else if (child instanceof Resources) {
      self.services[child.$base] = child;
    }
    else if (child instanceof Method) {
      self.services[child.$id] = child;
    }
    else if (child instanceof Documentation) {
    }
  }
}

Application.elementName = 'application';
Application.allowedChildren = ['types', 'message', 'portType', 'binding',
  'service', 'import', 'documentation', 'import', 'any',
  'grammars', 'resources'];

Application.targetNamespace = "http://wadl.dev.java.net/2009/02";
  
module.exports = Application;
