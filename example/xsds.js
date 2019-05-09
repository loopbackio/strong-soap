// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var soap = require('..').soap;
var WSDL = soap.WSDL;
var path = require('path');


//user can pass in WSDL options
var options = {};

WSDL.open(path.resolve(__dirname, 'wsdls/weather.wsdl'), options,
  //User can traverse the WSDL tree and get to bindings - > operations, services, portTypes, messages, parts and XSD elements/Attributes
  function(err, wsdl) {
    var getCityForecastOp = wsdl.definitions.bindings.WeatherSoap.operations.GetCityForecastByZIP;
    console.log(getCityForecastOp.$name);
    var service = wsdl.definitions.services['Weather'];
    console.log(service.$name);
  });
