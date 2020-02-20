// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";

var soap = require('..').soap,
    assert = require('assert');

describe('Nillable tests ', function() {

  /*
   In case of nillable="true" defined on 'breed' simpleType in the WSDL. If value of 'breed' is null,
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" is added to indicate the value
   is null for this element.

   Request
   <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
   <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
     <soap:Header/>
     <soap:Body>
       <ns1:addPets xmlns:ns1="http://tempuri.org/">
         <pet>
           <Name>max</Name>
           <Breed xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
         </pet>
         <pet>
           <Name>sunny</Name>
           <Breed>Labrador</Breed>
         </pet>
       </ns1:addPets>
     </soap:Body>
   </soap:Envelope>
   */

    it("nillable='true' defined for simpleType", function (done) {
      soap.createClient(__dirname + '/wsdl/strict/nillable.wsdl', function (err, client) {
        assert.ok(!err);
        var requestArgs = {
         "pet": [
           {
            "Name"  : "max",
            "Breed" : null
           },
           {
            "Name": "sunny",
            "Breed": "Labrador"
           }
          ]
        };

        client.addPets(requestArgs, function (err, result, body) {
          var request = client.lastMessage;
          //check if the Breed element has xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" atttribute
          var index = request.indexOf('<Breed xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>');
          assert.ok(index > -1);
          done();
        });
      });
    });

    /*
    In case of nillable="true" defined on 'pet' complexType in the WSDL. If value of 'pet' is null,
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" is added to indicate the value
    is null for this element.

     Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
        <soap:Header/>
        <soap:Body>
            <ns1:addPets xmlns:ns1="http://tempuri.org/">
                <pet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
            </ns1:addPets>
        </soap:Body>
     </soap:Envelope>
     */

    it("nillable='true' defined for complexType", function (done) {
      soap.createClient(__dirname + '/wsdl/strict/nillable.wsdl', function (err, client) {
        assert.ok(!err);
        var requestArgs = {
            "pet": null
        };

        client.addPets(requestArgs, function (err, result, body) {
          var request = client.lastMessage;
          //check if the pet element has xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" atttribute
          var index = request.indexOf('<pet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>');
          assert.ok(index > -1);
          done();
        });
      });
    });

});


