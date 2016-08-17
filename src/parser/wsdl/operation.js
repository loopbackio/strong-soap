var WSDLElement = require('./wsdlElement');
var descriptor = require('../xsd/descriptor');
var ElementDescriptor = descriptor.ElementDescriptor;
var TypeDescriptor = descriptor.TypeDescriptor;
var QName = require('../qname');

var assert = require('assert');

const Style = {
  documentLiteralWrapped: 'documentLiteralWrapped',
  documentLiteral: 'documentLiteral',
  rpcLiteral: 'rpcLiteral',
  rpcEncoded: 'rpcEncoded',
  documentEncoded: 'documentEncoded'
};

class Operation extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.faults = {};
  }

  addChild(child) {
    switch (child.name) {
      case 'input':
        this.input = child;
        break;
      case 'output':
        this.output = child;
        break;
      case 'fault':
        this.faults[child.$name] = child;
        break;
      case 'operation': // soap:operation
        this.soapAction = child.$soapAction || '';
        this.style = child.$style || '';
        break;
    }
  }

  postProcess(definitions) {
    if (this._processed) return; // Already processed
    if (this.input) this.input.postProcess(definitions);
    if (this.output) this.output.postProcess(definitions);
    for (var f in this.faults) {
      this.faults[f].postProcess(definitions);
    }
    if (this.parent.name === 'binding') {
      this.getMode();
    }
    this._processed = true;
  }

  static describeHeaders(param) {
    if (param == null) return null;
    var headers = new descriptor.TypeDescriptor();
    if (!param.headers) return headers;
    param.headers.forEach(function(header) {
      var part = header.part;
      if (part && part.element) {
        headers.addElement(part.element.describe(definitions));
      } else if (part && part.type) {
        console.warn('WS-I violation: ' +
          'http://ws-i.org/profiles/basicprofile-1.2-2010-11-09.html#BP2113' +
          ' part ' + part.$name);
      }
    });
    return headers;
  }

  describeFaults(definitions) {
    var faults = {};
    for (var f in this.faults) {
      let fault = this.faults[f];
      let part = fault.fault && fault.fault.part;
      if (part && part.element) {
        faults[f] = part.element.describe(definitions);
      } else {
        console.warn('WS-I violation: ' +
          'http://ws-i.org/profiles/basicprofile-1.2-2010-11-09.html#BP2113' +
          ' part ' + part.$name);
      }
    }
    return faults;
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var input, output;
    switch (this.mode) {
      case Style.documentLiteralWrapped:
        if (this.input && this.input.body) {
          for (let p in this.input.body.parts) {
            let wrapperElement = this.input.body.parts[p].element;
            if (wrapperElement) {
              input = wrapperElement.describe(definitions);
            }
            break;
          }
        }
        if (this.output && this.output.body) {
          for (let p in this.output.body.parts) {
            let wrapperElement = this.output.body.parts[p].element;
            if (wrapperElement) {
              output = wrapperElement.describe(definitions);
            }
            break;
          }
        }
        break;
      case Style.documentLiteral:
        input = new descriptor.TypeDescriptor();
        output = new descriptor.TypeDescriptor();
        if (this.input && this.input.body) {
          for (let p in this.input.body.parts) {
            let element = this.input.body.parts[p].element;
            if (element) {
              input.addElement(element.describe(definitions));
            }
          }
        }
        if (this.output && this.output.body) {
          for (let p in this.output.body.parts) {
            let element = this.output.body.parts[p].element;
            if (element) {
              output.addElement(element.describe(definitions));
            }
          }
        }
        break;
      case Style.rpcLiteral:
      case Style.rpcEncoded:
        // The operation wrapper element
        let nsURI = (this.input && this.input.body &&
          this.input.body.namespace) || this.targetNamespace;
        input = new descriptor.ElementDescriptor(
          new QName(nsURI, this.$name), null, 'qualified', false);
        output = new descriptor.ElementDescriptor(
          new QName(nsURI, this.$name + 'Response'), null, 'qualified', false);
        let inputParts = new descriptor.TypeDescriptor();
        let outputParts = new descriptor.TypeDescriptor();
        if (this.input && this.input.body) {
          for (let p in this.input.body.parts) {
            let part = this.input.body.parts[p];
            let type;
            if (part.type) {
              type = part.type.qname;
            } else if (part.element) {
              type = part.element.type.qname;
            }
            let element = new descriptor.ElementDescriptor(
              new QName(nsURI, p), type, 'unqualified', false);
            inputParts.addElement(element);
          }
        }
        if (this.output && this.output.body) {
          for (let p in this.output.body.parts) {
            let part = this.output.body.parts[p];
            let type;
            if (part.type) {
              type = part.type.qname;
            } else if (part.element) {
              type = part.element.type.qname;
            }
            let element = new descriptor.ElementDescriptor(
              new QName(nsURI, p), type, 'unqualified', false);
            outputParts.addElement(element);
          }
        }
        input.elements = inputParts.elements;
        output.elements = outputParts.elements;
        break;
      case Style.documentEncoded:
        throw new Error('WSDL style not supported: ' + Style.documentEncoded);
    }

    let faults = this.describeFaults(definitions);
    let inputHeaders = Operation.describeHeaders(this.input);
    let outputHeaders = Operation.describeHeaders(this.output);

    this.descriptor = {
      name: this.$name,
      style: this.mode,
      soapAction: this.soapAction,
      input: {
        body: input,
        headers: inputHeaders
      },
      output: {
        body: output,
        headers: outputHeaders
      },
      faults: this.faults
    };
    this.descriptor.inputEnvelope =
      Operation.createEnvelopeDescriptor(this.descriptor.input, false);
    this.descriptor.outputEnvelope =
      Operation.createEnvelopeDescriptor(this.descriptor.output, true);
    return this.descriptor;
  }

  static createEnvelopeDescriptor(parameterDescriptor, isOutput, prefix, nsURI) {
    prefix = prefix || 'soap';
    nsURI = nsURI || 'http://schemas.xmlsoap.org/soap/envelope/';
    var descriptor = new TypeDescriptor();

    var envelopeDescriptor = new ElementDescriptor(
      new QName(nsURI, 'Envelope', prefix), null, 'qualified', false);
    descriptor.add(envelopeDescriptor);

    var headerDescriptor = new ElementDescriptor(
      new QName(nsURI, 'Header', prefix), null, 'qualified', false);

    var bodyDescriptor = new ElementDescriptor(
      new QName(nsURI, 'Body', prefix), null, 'qualified', false);

    envelopeDescriptor.addElement(headerDescriptor);
    envelopeDescriptor.addElement(bodyDescriptor);

    if (parameterDescriptor && parameterDescriptor.body) {
      bodyDescriptor.add(parameterDescriptor.body);
    }

    if (parameterDescriptor && parameterDescriptor.headers) {
      bodyDescriptor.add(parameterDescriptor.headers);
    }

    if (isOutput && parameterDescriptor && parameterDescriptor.faults) {
      let xsdStr = new QName(helper.namespaces.xsd, 'string', 'xsd');
      let faultDescriptor = new ElementDescriptor(
        new QName(nsURI, 'Fault', prefix), null, 'qualified', false);
      faultDescriptor.add(
        new ElementDescriptor(nsURI, 'faultcode', xsdStr, 'qualified', false));
      faultDescriptor.add(
        new ElementDescriptor(nsURI, 'faultstring', xsdStr, 'qualified', false));
      faultDescriptor.add(
        new ElementDescriptor(nsURI, 'faultactor', xsdStr, 'qualified', false));
      let detailDescriptor =
        new ElementDescriptor(nsURI, 'detail', null, 'qualified', false);
      faultDescriptor.add(detailDescriptor);

      for (let f in parameterDescriptor.faults) {
        detailDescriptor.add(parameterDescriptor.faults[f]);
      }
    }

    return descriptor;
  }

  getMode() {
    let use = this.input && this.input.body && this.input.body.use || 'literal';
    if (this.style === 'document' && use === 'literal') {
      // document literal
      let element = null;
      let count = 0;
      if (this.input && this.input.body) {
        for (let p in this.input.body.parts) {
          let part = this.input.body.parts[p];
          element = part.element;
          assert(part.element && !part.type,
            'Document/literal part should use element');
          count++;
        }
      }
      // Only one part and the input wrapper element has the same name as
      // operation
      if (count === 1 && element.$name === this.$name) {
        count = 0;
        if (this.output && this.output.body) {
          for (let p in this.output.body.parts) {
            let part = this.output.body.parts[p];
            element = part.element;
            assert(part.element && !part.type,
              'Document/literal part should use element');
            count++;
          }
        }
        if (count === 1) {
          this.mode = Style.documentLiteralWrapped;
        } else {
          this.mode = Style.documentLiteral;
        }
      } else {
        this.mode = Style.documentLiteral;
      }
    } else if (this.style === 'document' && use === 'encoded') {
      this.mode = Style.documentEncoded;
    } else if (this.style === 'rpc' && use === 'encoded') {
      this.mode = Style.rpcEncoded;
    } else if (this.style === 'rpc' && use === 'literal') {
      this.mode = Style.rpcLiteral;
    }
    return this.mode;
  }

}

Operation.Style = Style;
Operation.elementName = 'operation';
Operation.allowedChildren = ['documentation', 'input', 'output', 'fault',
  'operation'];

module.exports = Operation;

