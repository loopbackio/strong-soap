var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;
var WSDL = soap.WSDL;
var fs = require('fs');
var path = require('path');

var util = require('util');


var xmlFile = fs.readFileSync(
  path.resolve(__dirname, '..', 'cybersource instance doc_cutdown.xml'),
  {encoding: 'utf-8'},
);


WSDL.open(
  path.resolve(__dirname, '..', 'xsds', 'CyberSourceTransaction_1.51.xsd'),
  {},
  function(err, wsdl) {
    // var xmlHandler = new XMLHandler();
    xmlHandler = new XMLHandler(
      wsdl.definitions.schemas,
      {},
    );

    var json = xmlHandler.xmlToJson(null, xmlFile, null);
    console.log('json ', JSON.stringify(json, null, 2));

    var node = xmlHandler.jsonToXml(
      null,
      null,
      XMLHandler.createSOAPEnvelopeDescriptor('urn:schemas-cybersource-com:transaction-data-1.51'),
      json,
    );
    var xml = node.end({pretty: true});
    console.log('xml ', xml);
  },
);
