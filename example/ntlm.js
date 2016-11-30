
"use strict";

var fs = require('fs');
var assert = require('assert');
var request = require('request');
var http = require('http');
var lastReqAddress;
var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;
var xmlHandler = new XMLHandler();
var util = require('util');
var NTLMSecurity = require('..').NTLMSecurity;

//example to show how to authenticate

//wsdl of the NTLM authenticated Web Service this client is going to invoke.
//var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL';
var url = './wsdls/weather.wsdl';
//JSON request
var requestArgs = {
  //Fill in based on your wsdl
  ZIP: '94306'
};

//FILL_IN
var username = "fill_in";
var password = "fill_in";
var domain = "fill_in";
var workstation = "fill_in";
//change it to 'false' or don't set this param, if you don't want WSDL 'GET' from remote NTLM webservice doesn't require NTLM authentication
var wsdlAuthRequired = true;
var ntlmSecurity = new NTLMSecurity(username, password, domain, workstation, wsdlAuthRequired);
var clientOptions = {};
clientOptions.NTLMSecurity = ntlmSecurity;


soap.createClient(url, clientOptions, function(err, client) {
  var service = 'service_name';
  var port = 'port_name';
  var operation = 'operation_name';
  //navigate to the correct operation in the client using [service][port][operation] since GetCityWeatherByZIP operation is used
  //by more than one port.
  var method = client[service][port][operation];

  //you can also call
  method(requestArgs, function(err, result, envelope, soapHeader) {
    console.log('Response envelope:');
    //response envelope
    console.log(envelope);

  }, null, null);
});
