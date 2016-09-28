
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
  //you can also call
  method(requestArgs, function(err, result, envelope, soapHeader) {
    //response envelope
    console.log(envelope);
    //result in SOAP envelope body which is the wrapper element. In this case, result object corresponds to GetCityForecastByZIPResponse
    console.log(JSON.stringify(result));
    //this describes the entire WSDL in a tree form.
    var description = client.describe();
    //inspect GetCityWeatherByZIP operation
    var operation = description.Weather.WeatherSoap.GetCityWeatherByZIP;

    var node = xmlHandler.jsonToXml(null, null,
      XMLHandler.createSOAPEnvelopeDescriptor('soap'), result);
    var xml = node.end({pretty: true});
    console.log(xml);

    var root = xmlHandler.xmlToJson(null, xml, null);
    console.log('%s', util.inspect(root, {depth: null}));

    var root = XMLHandler.parseXml(null, xml);
    var result = root.end({pretty: true});
    console.log(result);


  }, null, customRequestHeader);
});
