// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;

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

var root = XMLHandler.parseXml(null, xmlString);
var result = root.end({pretty: true});
console.log(result);

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


