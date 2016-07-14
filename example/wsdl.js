var path = require('path');
var soap = require('../index');
var XMLHandler = soap.XMLHandler;
var NamespaceContext = soap.NamespaceContext;

soap.createClient(path.join(__dirname, 'wsdls/td.wsdl'), {},
  function(err, client) {
    if (err) {
      console.error(err);
      return;
    }
    var definitions = client.wsdl.definitions;
    var operation = definitions.services['IFX_Payment']
      .ports['Pmt_SoapPort_20120910'].binding.operations['IFX_PaymentAdd'];

    var req = {
      IFX_PaymentAdd: {
        SignonRq: {
          ClientApp: {
            Org: 'IBM',
            Name: 'TestApp'
          }
        },
        BankSvcRq: [
          {
            RqUID: '1',
            PmtInqRq: [{
              RqUID: '2'
            }],
            $attributes: {
              Id: 'id'
            }
          }
        ]
      }
    };

    // var method = client['IFX_Payment']['Pmt_SoapPort_20120910']['IFX_PaymentAdd'];
    // method(req, console.log);

    console.log(operation.describe(definitions));

    var ns = 'http://services.tdgroup.com/ifxpmt/2012/09/10';
    var schema = definitions.schemas[ns];

    var element = schema.elements['IFX_PmtAddRq'];

    var descriptor = element.describe(definitions);
    var xmlHandler = new XMLHandler();
    var nsContext = new NamespaceContext();
    for (let prefix in schema.xmlns) {
      nsContext.addNamespace(prefix, schema.xmlns[prefix]);
    }

    var root = XMLHandler.createSOAPEnvelope();

    var node = xmlHandler.jsonToXml(root.body, nsContext, descriptor,
      req.IFX_PaymentAdd, {
        attributesKey: '$attributes'
      });
    var xml = node.end({pretty: true});
    console.log(xml);
  });
