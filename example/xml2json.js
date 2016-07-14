var soap = require('../index');
var XMLHandler = soap.XMLHandler;

var xmlHandler = new XMLHandler();
var util = require('util');

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

var root = xmlHandler.xmlToJson(null, xmlString, null);
console.log('%s', util.inspect(root, {depth: null}));

/*
var stream = require('stream');
var xmlStream = new stream.Readable();

xmlHandler.parseXml(null, xmlStream, function(err, root) {
  var result = root.end({pretty: true});
  console.log('Stream', result);
});

xmlStream.push(xmlString);    // the string you want
xmlStream.push(null);
*/


