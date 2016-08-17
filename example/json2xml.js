var soap = require('../index');
var XMLHandler = soap.XMLHandler;

var xmlHandler = new XMLHandler();
var util = require('util');

var json = {
  Envelope: {
    Header: undefined,
    Body: {
      IFX_PmtInqRq: {
        SignonRq: {ClientApp: {Org: 'IBM', Name: 'TestApp'}},
        BankSvcRq: [{
          '$attributes': {Id: 'id1'},
          RqUID: '1',
          PmtInqRq: {RqUID: '11'}
        },
          {
            '$attributes': {Id: 'id2'},
            RqUID: '2',
            PmtInqRq: {RqUID: '22'}
          }]
      }
    }
  }
};

var node = xmlHandler.jsonToXml(null, null,
  XMLHandler.createSOAPEnvelopeDescriptor('soap'), json);
var xml = node.end({pretty: true});
console.log(xml);

var xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <com.td.payment:IFX_PmtInqRq xmlns:com.td.payment="http://services.tdgroup.com/ifxpmt/2012/09/10">
      <IFX:SignonRq xmlns:IFX="http://services.tdgroup.com/IFX170_XSD/2008/08/14">
        <IFX:ClientApp>
          <IFX:Org>IBM</IFX:Org>
          <IFX:Name>TestApp</IFX:Name>
        </IFX:ClientApp>
      </IFX:SignonRq>
      <com.td.payment:BankSvcRq Id="id1">
        <IFX:RqUID>1</IFX:RqUID>
        <com.td.payment:PmtInqRq>
          <IFX:RqUID>11</IFX:RqUID>
        </com.td.payment:PmtInqRq>
      </com.td.payment:BankSvcRq>
      <com.td.payment:BankSvcRq Id="id2">
        <IFX:RqUID>2</IFX:RqUID>
        <com.td.payment:PmtInqRq>
          <IFX:RqUID>22</IFX:RqUID>
        </com.td.payment:PmtInqRq>
      </com.td.payment:BankSvcRq>
    </com.td.payment:IFX_PmtInqRq>
  </soap:Body>
</soap:Envelope>`;


