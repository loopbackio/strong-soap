// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";

var soap = require('..').soap,
    assert = require('assert');

describe('Undefined tests', function() {

  /*
  If value of 'breed' (simpleType in the WSDL) is undefined,
  and options.ignoreAttributesUndefined is true, the element will be empty.

   Request
   <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
   <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
     <soap:Header/>
     <soap:Body>
       <ns1:addPets xmlns:ns1="http://tempuri.org/">
         <pet>
           <Name>max</Name>
           <Breed/>
         </pet>
         <pet>
           <Name>sunny</Name>
           <Breed>Labrador</Breed>
         </pet>
       </ns1:addPets>
     </soap:Body>
   </soap:Envelope>
   */

    it("undefined and options.ignoreAttributesUndefined false for simpleType", function (done) {
      soap.createClient(__dirname + '/wsdl/strict/nillable.wsdl',{
        "ignoreAttributesUndefined":false
      }, function (err, client) {
        assert.ok(!err);
        var requestArgs = {
         "pet": [
           {
            "Name"  : "max",
            "Breed" : undefined
           },
           {
            "Name": "sunny",
            "Breed": "Labrador"
           }
          ]
        };

        client.addPets(requestArgs, function (err, result, body) {
          var request = client.lastMessage;
          //check if the Breed element is empty
          var index = request.indexOf('<Breed/>');
          assert.ok(index > -1);
          done();
        });
      });
    });

    /*
    In case of nillable="true" defined on 'pet' complexType in the WSDL. If value of 'pet' is undefined,
    and options.ignoreAttributesUndefined is true the element will be empty.

     Request
     <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
        <soap:Header/>
        <soap:Body>
            <ns1:addPets xmlns:ns1="http://tempuri.org/">
                <pet/>
            </ns1:addPets>
        </soap:Body>
     </soap:Envelope>
     */

    it("undefined and options.ignoreAttributesUndefined false for complexType", function (done) {
      soap.createClient(__dirname + '/wsdl/strict/nillable.wsdl',{
        "ignoreAttributesUndefined":false
      }, function (err, client) {
        assert.ok(!err);
        var requestArgs = {
            "pet": undefined
        };

        client.addPets(requestArgs, function (err, result, body) {
          var request = client.lastMessage;
          //check if the pet element has xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" atttribute
          var index = request.indexOf('<pet/>');
          assert.ok(index > -1);
          done();
        });
      });
    });

});