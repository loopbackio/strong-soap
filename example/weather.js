
"use strict";

var fs = require('fs'),
  assert = require('assert'),
  request = require('request'),
  http = require('http'),
  lastReqAddress;
var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;
var xmlHandler = new XMLHandler();
var util = require('util');

//wsdl of the Web Service this client is going to invoke. This can point to local wsdl as well.
var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL';
var requestArgs = {
  ZIP: '94306'
};
var clientOptions = {};


soap.createClient(url, clientOptions, function(err, client) {
  //custom request header
  var customRequestHeader = {timeout: 5000};
  var options = {};
  //navigate to the correct operation in the client using [service][port][operation] since GetCityWeatherByZIP operation is used
  //by more than one port.
  var method = client['Weather']['WeatherSoap']['GetCityWeatherByZIP'];
  //this describes the entire WSDL in a tree form.
  var description = client.describe();
  //inspect GetCityWeatherByZIP operation
  var operation = description.Weather.WeatherSoap.GetCityWeatherByZIP;
  console.log('Invoking operation: ' + operation.name);

  //you can also call
  method(requestArgs, function(err, result, envelope, soapHeader) {
    console.log('Response envelope:');
    //response envelope
    console.log(envelope);

    var response;
    if (!err) {
      console.log('Result:');
      //result in SOAP envelope body which is the wrapper element. In this case, result object corresponds to GetCityForecastByZIPResponse
      console.log(JSON.stringify(result));
      response = result;
    } else {
      response = err.root;
    }

    var node = xmlHandler.jsonToXml(null, null,
        XMLHandler.createSOAPEnvelopeDescriptor('soap'), response);

    var xml = node.end({pretty: true});
    console.log('jsonToXml:');
    console.log(xml);

    var root;
    try {
      root = xmlHandler.xmlToJson(null, xml, null);
    } catch (error) {
    //do nothing
    }

    var root = XMLHandler.parseXml(null, xml);
    var result = root.end({pretty: true});
    console.log('parseXml:');
    console.log(result);


  }, null, customRequestHeader);
});
