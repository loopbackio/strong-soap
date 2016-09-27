var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;

var xmlHandler = new XMLHandler();
var util = require('util');

var json = {
  Envelope: {
    Header: undefined,
    Body: {
      BookStore: {
        Detail: {StoreDetail: {Name: 'Modern Book Store', Address: '1001 Lane'}},
        Genre: [{
          '$attributes': {Id: 'id1'},
          Aisle: '1',
          Name: {Fiction: '11'}
        },
          {
            '$attributes': {Id: 'id2'},
            Aisle: '2',
            Name: {NonFiction: '22'}
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
    <ns1:BookStore xmlns:ns1="http://bookstore.com/">
      <ns2:Detail xmlns:ns2="http://bookstore.com/detail">
        <ns2:StoreDetail>
          <ns2:Name>Modern Book Store</ns2:Name>
          <ns2:Address>1001 Lane</ns2:Address>
        </ns2:StoreDetail>
      </ns2:Detail>
      <ns1:Genre Id="id1">
        <ns2:Aisle>1</ns2:Aisle>
        <ns1:Name>
          <ns2:Fiction>11</ns2:Fiction>
        </ns1:Name>
      </ns1:Genre>
      <ns1:Genre Id="id2">
        <ns2:Aisle>2</ns2:Aisle>
        <ns1:Name>
          <ns2:NonFiction>22</ns2:NonFiction>
        </ns1:Name>
      </ns1:Genre>
    </ns1:BookStore>
  </soap:Body>
</soap:Envelope>`;


