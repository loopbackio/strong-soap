var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;
var WSDL = soap.WSDL;
var fs = require('fs');
var path = require('path');

var util = require('util');

WSDL.open(
  path.resolve(__dirname, 'wsdls', 'AddressLookupSOAP2.wsdl'),
  {},
  function(err, wsdl) {
    xmlHandler = new XMLHandler(wsdl.definitions.schemas, {});

    /*     var json = {
      postcodeResponse:{
      $attributes: {
        $xsiType: {
          type: 'Address',
          xmlns: 'http://apimtest.org/AddressLookup/',
        },
      },
      street: 'Anywhere Street',
      town: 'Beyond',
      county: 'Cupboardshire',
      country: 'UK',
      postcode: '4321',
      }
    };

    var node = xmlHandler.jsonToXml(
        null,
        null,
        null,
        json,
      ); */

    var json = {
      $attributes: {
        $xsiType: {
          type: 'Address',
          xmlns: 'http://apimtest.org/AddressLookup/',
        },
      },
      street: 'Anywhere Street',
      town: 'Beyond',
      county: 'Cupboardshire',
      country: 'UK',
      postcode: '4321',
    };

    var node = xmlHandler.jsonToXml(
      null,
      null,
      wsdl.definitions.schemas[
        'http://apimtest.org/AddressLookup/'
      ].children[1].describe(wsdl.definitions),
      json,
    );

    var xml = node.end({pretty: true});
    console.log('xml ', xml);
  },
);
