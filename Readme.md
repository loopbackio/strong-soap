# Soap 

> A SOAP client and server for node.js.

This module provides SOAP client for invoking Web Services. It also provides a mock up SOAP server capability to create and test your Web service. This module is re-implemented based on `node-soap` module.

<!-- Run `npm run toc` to update below section -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
- [Install](#install)
- [Client](#client)
  - [Client.describe() - description of services, ports and methods as a JavaScript object](#clientdescribe---description-of-services-ports-and-methods-as-a-javascript-object)
  - [Client.setSecurity(security) - use the specified security protocol](#clientsetsecuritysecurity---use-the-specified-security-protocol)
  - [Client.*method*(args, callback) - call *method* on the SOAP service.](#clientmethodargs-callback---call-method-on-the-soap-service)
  - [Client.*service*.*port*.*method*(args, callback[, options[, extraHeaders]]) - call a *method* using a specific *service* and *port*](#clientserviceportmethodargs-callback-options-extraheaders---call-a-method-using-a-specific-service-and-port)
  - [Client.*lastRequest*](#clientlastrequest)
  - [Client.setEndpoint(url)](#clientsetendpointurl)
  - [Client Events](#client-events)
- [Security](#security)
  - [BasicAuthSecurity](#basicauthsecurity)
  - [BearerSecurity](#bearersecurity)
  - [ClientSSLSecurity](#clientsslsecurity)
  - [WSSecurity](#wssecurity)
  - [WSSecurityCert](#wssecuritycert)
- [SOAP Headers](#soap-headers)
  - [Received SOAP Headers](#received-soap-headers)
  - [Outgoing SOAP Headers](#outgoing-soap-headers)
- [XML Attributes](#xml-attributes)
  - [Handling XML Attributes](#handling-xml-attributes)
  - [Overriding the value key](#overriding-the-value-key)
  - [Overriding the xml key](#overriding-the-xml-key)  
- [XMLHandler](#xmlhandler)
- [WSDL](#wsdl)  
- [Server](#server)
  - [soap.listen(*server*, *path*, *services*, *wsdl*) - create a new SOAP server that listens on *path* and provides *services*.](#soaplistenserver-path-services-wsdl---create-a-new-soap-server-that-listens-on-path-and-provides-services)
  - [Options](#options)
  - [Server Logging](#server-logging)
  - [Server Events](#server-events)
  - [SOAP Fault](#soap-fault)
  - [Server security example using PasswordDigest](#server-security-example-using-passworddigest)
  - [Server connection authorization](#server-connection-authorization)
- [soap-stub](#soap-stub)
  - [Example](#example)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features:

* Full SOAP Client capability & mock up SOAP server capability
* Handles both RPC and Document styles
* Handles both SOAP 1.1 and SOAP 1.2 Fault
* APIs to parse XML --> JSON and JSON --> XML
* API to describe WSDL document
* Support for both synchronous and asynchronous method handlers
* WS-Security (currently only UsernameToken and PasswordText encoding is supported)

## Install

Install with [npm](http://github.com/isaacs/npm):

```
  npm install strong-soap
```

## Client

- Start with the WSDL for the Web Service you want to invoke. For e.g the Weather Web Service http://wsf.cdyne.com/WeatherWS/Weather.asmx and the WSDL is http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL

- Create a new SOAP client from WSDL url using soap.createClient(url[, options], callback) API. Also supports a local filesystem path. An instance of `Client` is passed to the `soap.createClient` callback.  It is used to execute methods on the soap service.
```
      var soap = require('strong-soap').soap;
      //wsdl of the Web Service this client is going to invoke. This can point to local wsdl as well.
      var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL';
      var requestArgs = {
        ZIP: '94306'
      };
      var options = {};

      soap.createClient(url, options, function(err, client) {
        client.GetCityWeatherByZIP(requestArgs, function(err, result, envelope) {
          //response envelope
          console.log(envelope);
          //result in SOAP envelope body which is the wrapper element. In this case, result object corresponds to GetCityForecastByZIPResponse
          console.log(JSON.stringify(result));
        });
      });
```
The Request envelope created by above service invocation. 
 ```
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ns1:GetCityWeatherByZIP xmlns:ns1="http://ws.cdyne.com/WeatherWS/">
      <ns1:ZIP>94306</ns1:ZIP>
    </ns1:GetCityWeatherByZIP>
  </soap:Body>
</soap:Envelope>
 ```
This WSDL operation is defined as document/literal-wrapped style. Hence the request in soap <Body> is wrapped in operation name. Refer to test cases [server-client-document-test](https://github.com/strongloop/strong-soap/blob/master/test/server-client-document-test.js) and  [server-client-rpc-test](https://github.com/strongloop/strong-soap/blob/master/test/server-client-rpc-test.js) to understand document and rpc styles and their 
Request, Response and Fault samples. 

The `options` argument allows you to customize the client with the following properties:

- endpoint: to override the SOAP service's host specified in the `.wsdl` file.
- request: to override the [request](https://github.com/request/request) module.
- httpClient: to provide your own http client that implements `request(rurl, data, callback, exheaders, exoptions)`.
- envelopeKey: to set specific key instead of <pre><<b>soap</b>:Body></<b>soap</b>:Body></pre>
- wsdl_options: custom options for the request module on WSDL requests.
- wsdl_headers: custom HTTP headers to be sent on WSDL requests.

Note: for versions of node >0.10.X, you may need to specify `{connection: 'keep-alive'}` in SOAP headers to avoid truncation of longer chunked responses.


### Extra Headers (optional)

User can define extra HTTP headers to be sent on the request.

```
      soap.createClient(url, clientOptions, function(err, client) {
        //custom request header
        var customRequestHeader = {customheader1: 'test1'};
        client.GetCityWeatherByZIP(requestArgs, function(err, result, envelope) {
          //result in SOAP envelope body which is the wrapper element. In this case, result object corresponds to GetCityForecastByZIPResponse
          console.log(JSON.stringify(result));
        }, null, customRequestHeader);
      });
```

### Client.describe() - description of services, ports and methods as a JavaScript object

``` javascript
          //this describes the entire WSDL in a JSON tree object form.
          var description = client.describe();
          //inspect GetCityWeatherByZIP operation. You can inspect Service: {Port: {operation: {
          console.log(JSON.stringify(description.Weather.WeatherSoap.GetCityWeatherByZIP));
```


### Client.setSecurity(security) - use the specified security protocol

Refer to test case [ssl-test](https://github.com/strongloop/strong-soap/blob/master/test/ssl-test.js) for this API usage.


### Client.*method*(args, callback) - call *method* on the SOAP service.

``` javascript
  client.MyFunction({name: 'value'}, function(err, result, envelope, soapHeader) {
      // result is a javascript object
      // envelope is the response envelope from the Web Service
      // soapHeader is the response soap header as a javascript object
  })
```
### Client.*service*.*port*.*method*(args, callback[, options[, extraHeaders]]) - call a *method* using a specific *service* and *port*

``` javascript
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // result is a javascript object
  })
```

#### Options (optional)

 - Accepts any option that the request module accepts, see [here.](https://github.com/mikeal/request)
 - For example, you could set a timeout of 5 seconds on the request like this:
``` javascript
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // result is a javascript object
  }, {timeout: 5000})
```

- You can measure the elapsed time on the request by passing the time option:
``` javascript
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // client.lastElapsedTime - the elapsed time of the last request in milliseconds
  }, {time: true})
```


#### Alternative method call using callback-last pattern

To align method call signature with node' standard callback-last pattern and event allow promisification of method calls, the following method signatures are also supported:

```javascript
client.MyService.MyPort.MyFunction({name: 'value'}, options, function (err, result) {
  // result is a javascript object
})

client.MyService.MyPort.MyFunction({name: 'value'}, options, extraHeaders, function (err, result) {
  // result is a javascript object
})
```

### Client.*lastRequest* 

The property that contains last full soap request for client logging

### Client.setEndpoint(url) 

Overwrites the SOAP service endpoint address

### Client Events
Client instances emit the following events:

* request - Emitted before a request is sent. The event handler receives the
entire Soap request (Envelope) including headers.
* message - Emitted before a request is sent. The event handler receives the
Soap body contents. Useful if you don't want to log /store Soap headers.
* soapError - Emitted when an erroneous response is received.
  Useful if you want to globally log errors.
* response - Emitted after a response is received. The event handler receives
the SOAP response body as well as the entire `IncomingMessage` response object.
This is emitted for all responses (both success and errors).

```
Refer to test case [ssl-test](https://github.com/strongloop/strong-soap/blob/master/test/client-test.js) for the usage. Here is one example of 'soapError' event

      soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', function (err, client) {
        var didEmitEvent = false;
        client.on('soapError', function(err) {
          didEmitEvent = true;
          assert.ok(err.root.Envelope.Body.Fault);
        });
        client.MyOperation({}, function(err, result) {
          assert.ok(didEmitEvent);
          done();
        });
      }, baseUrl);
```


### Security

`strong-soap` has several default security protocols.  You can easily add your own
as well.  The interface is quite simple. Each protocol defines 2 methods:
* `addOptions` - a method that accepts an options arg that is eventually passed directly to `request`
* `toXML` - a method that returns a string of XML.

### BasicAuthSecurity

``` javascript
  client.setSecurity(new soap.BasicAuthSecurity('username', 'password'));
```

### BearerSecurity

``` javascript
  client.setSecurity(new soap.BearerSecurity('token'));
```

### ClientSSLSecurity

_Note_: If you run into issues using this protocol, consider passing these options
as default request options to the constructor:
* `rejectUnauthorized: false`
* `strictSSL: false`
* `secureOptions: constants.SSL_OP_NO_TLSv1_2` (this is likely needed for node >= 10.0)

``` javascript
  client.setSecurity(new soap.ClientSSLSecurity(
    '/path/to/key'
    , '/path/to/cert'
    , {/*default request options*/}
  ));
```

### WSSecurity

`WSSecurity` implements WS-Security. UsernameToken and PasswordText/PasswordDigest is supported.

``` javascript
  var wsSecurity = new WSSecurity(username, password, options)
    //the 'options' object is optional and contains properties:
    //passwordType: 'PasswordDigest' or 'PasswordText' default is PasswordText
    //hasTimeStamp: true or false, default is true
    //hasTokenCreated: true or false, default is true
  client.setSecurity(wsSecurity);
```

### WSSecurityCert

WS-Security X509 Certificate support.

``` javascript
  var privateKey = fs.readFileSync(privateKeyPath);
  var publicKey = fs.readFileSync(publicKeyPath);
  var password = ''; // optional password
  var wsSecurity = new soap.WSSecurityCert(privateKey, publicKey, password, 'utf8');
  client.setSecurity(wsSecurity);
```

_Note_: Optional dependency 'ursa' is required to be installed successfully when WSSecurityCert is used.

## XML Attributes
### Handling XML Attributes, Value and XML (wsdlOptions)
Sometimes it is necessary to override the default behaviour of `strong-soap` in order to deal with the special requirements
of your code base or a third library you use. Therefore you can use the `wsdlOptions` Object, which is passed in the
`#createClient()` method and could have any (or all) of the following contents:
```javascript
var wsdlOptions = {
  attributesKey: 'theAttrs',
  valueKey: 'theVal',
  xmlKey: 'theXml'
}
```

If nothing (or an empty Object `{}`) is passed to the `#createClient()` method, the `strong-soap` defaults (`attributesKey: '$attributes'`, `valueKey: '$value'` and `xmlKey: '$xml'`) are used.

### Overriding the value key
By default, `strong-soap` uses `$value` as key for any parsed XML value which may interfere with your other code as it
could be some reserved word, or the `$` in general cannot be used for a key to start with.

You can define your own `valueKey` by passing it in the `wsdl_options` to the createClient call like so:
```javascript
var wsdlOptions = {
  valueKey: 'theVal'
};

soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', wsdlOptions, function (err, client) {
  // your code
});
```

### Overriding the xml key
As `valueKey`, `strong-soap` uses `$xml` as key. The xml key is used to pass XML Object without adding namespace or parsing the string.

Example :

```javascript
dom = {
     $xml: '<parentnode type="type"><childnode></childnode></parentnode>'
};
```

```xml
<tns:dom>
    <parentnode type="type">
          <childnode></childnode>
    </parentnode>
</tns:dom>
```

You can define your own `xmlKey` by passing it in the `wsdl_options` to the createClient call like so:
```javascript
var wsdlOptions = {
  xmlKey: 'theXml'
};

soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', wsdlOptions, function (err, client) {
  // your code
});
```

### Overriding the `attributes` key
You can achieve attributes like:
``` xml
<parentnode>
  <childnode name="childsname">
  </childnode>
</parentnode>
```
By attaching an attributes object to a node.
``` javascript
{
  parentnode: {
    childnode: {
      $attributes: {
        name: 'childsname'
      }
    }
  }
}
```
However, "attributes" may be a reserved key for some systems that actually want a node
```xml
<attributes>
</attributes>
```

In this case you can configure the attributes key in the `wsdlOptions` like so.
```javascript
var wsdlOptions = {
  attributesKey: '$attributes'
};

```

Adding xsiType

```
soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', wsdlOptions, function (err, client) {
  client.*method*({
    parentnode: {
      childnode: {
        $attributes: {
          $xsiType: "{xmlnsTy}Ty"
        }
      }
    }
  });
});
```

Removing the xsiType. The resulting Request shouldn't have the attribute xsiType

```
soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', wsdlOptions, function (err, client) {
  client.*method*({
    parentnode: {
      childnode: {
        $attributes: {
          
        }
      }
    }
  });
});
```

To see it in practice, consider the sample in: [test/request-response-samples/addPets__force_namespaces](https://github.com/strongloop/strong-soap/tree/master/test/request-response-samples/addPets__force_namespaces)

## XMLHandler
XMLHandler provides capabilities for the user to convert JSON object to XML and XML to JSON object.  It also provides capability to Parse XML string or stream into the XMLBuilder tree.

- API to Convert JSON object to XML and XML to JSON object. 

```
        var soap = require('..').soap;
        var XMLHandler = soap.XMLHandler;
        var xmlHandler = new XMLHandler();
        var util = require('util');
        
        //custom request header
        var customRequestHeader = {customheader1: 'test1'};
        var options = {};
        client.GetCityWeatherByZIP(requestArgs, function(err, result, envelope, soapHeader) {
          //convert 'result' JSON object to XML
          var node = xmlHandler.jsonToXml(null, null,
            XMLHandler.createSOAPEnvelopeDescriptor('soap'), result);
          var xml = node.end({pretty: true});
          console.log(xml);
        
          //convert XML to JSON object
          var root = xmlHandler.xmlToJson(null, xml, null);
          console.log('%s', util.inspect(root, {depth: null}));

        }, options, customRequestHeader);
      });
```

- Parse XML string or stream into the XMLBuilder tree

```
var root = XMLHandler.parseXml(null, xmlString);
```

## WSDL
### wsdl.open(wsdlURL, options, callback(err, wsdl))
API to load WSDL into a tree form. User can traverse through WSDL tree to get to bindings, services, ports, operations etc.
##### Parameters
  - `wsdlURL` WSDL url to load. 
  - `options` WSDL options
  - `callback` Error and WSDL loaded into object tree.

```
var soap = require('..').soap;
var WSDL = soap.WSDL;
var path = require('path');

//pass in WSDL options if any

var options = {};
WSDL.open('./wsdls/weather.wsdl',options,
    function(err, wsdl) {
    //user should be able to get to any information of this WSDL from this object. User can traverse
    //the WSDL tree and get to bindings, operations, services, portTypes, messages, parts and XSD elements/Attributes.
  
    var getCityForecastOp = wsdl.definitions.bindings.WeatherSoap.operations.GetCityForecastByZIP;
    //print operation name
    console.log(getCityForecastOp.name);
    var service = wsdl.definitions.services['Weather'];
    print service name 
    console.log(service.name);;
});
```

## Server 

### soap.listen(*server*, *path*, *services*, *wsdl*) - create a new SOAP server that listens on *path* and provides *services*.
*wsdl* is an xml string that defines the service.

``` javascript
  var myService = {
      MyService: {
          MyPort: {
              MyFunction: function(args) {
                  return {
                      name: args.name
                  };
              },

              // This is how to define an asynchronous function.
              MyAsyncFunction: function(args, callback) {
                  // do some work
                  callback({
                      name: args.name
                  });
              },

              // This is how to receive incoming headers
              HeadersAwareFunction: function(args, cb, headers) {
                  return {
                      name: headers.Token
                  };
              },

              // You can also inspect the original `req`
              reallyDeatailedFunction: function(args, cb, headers, req) {
                  console.log('SOAP `reallyDeatailedFunction` request from ' + req.connection.remoteAddress);
                  return {
                      name: headers.Token
                  };
              }
          }
      }
  };

  var xml = require('fs').readFileSync('myservice.wsdl', 'utf8'),
      server = http.createServer(function(request,response) {
          response.end("404: Not Found: " + request.url);
      });

  server.listen(8000);
  soap.listen(server, '/wsdl', myService, xml);

```

Example of SOAP server usage is in [test/server-client-document-test](https://github.com/strongloop/strong-soap/tree/master/test/server-client-document-test.js)

### Options
You can pass in server and [WSDL Options](#handling-xml-attributes-value-and-xml-wsdloptions)
using an options hash.

``` javascript
var xml = require('fs').readFileSync('myservice.wsdl', 'utf8');

soap.listen(server, {
    // Server options.
    path: '/wsdl',
    services: myService,
    xml: xml,

    // WSDL options.
    attributesKey: 'theAttrs',
    valueKey: 'theVal',
    xmlKey: 'theXml'
});
```

### Server Logging

If the `log` method is defined it will be called with 'received' and 'replied'
along with data.

``` javascript
  server = soap.listen(...)
  server.log = function(type, data) {
    // type is 'received' or 'replied'
  };
```

### Server Events

Server instances emit the following events:

* request - Emitted for every received messages.
  The signature of the callback is `function(request, methodName)`.
* headers - Emitted when the SOAP Headers are not empty.
  The signature of the callback is `function(headers, methodName)`.

The sequence order of the calls is `request`, `headers` and then the dedicated
service method.

```
    test.soapServer.on('request', function requestManager(request, methodName) {
      assert.equal(methodName, 'GetLastTradePrice');
      done();
    });

```

Example of SOAP server usage in [test/server-test](https://github.com/strongloop/strong-soap/tree/master/test/server-test.js)

### SOAP Fault

A service method can reply with a SOAP Fault to a client by `throw`ing an
object with a `Fault` property.

Example SOAP 1.1 Fault
``` javascript
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            throw {
              Fault: {
                  faultcode: "sampleFaultCode",
                  faultstring: "sampleFaultString",
                  detail:
                    { myMethodFault:
                      {errorMessage: 'MyMethod Business Exception message', value: 10}
                    }
                }
            }
          }
        }
      }
    }
```

SOAP 1.2 Fault

``` javascript
    test.service = {
      DocLiteralWrappedService: {
        DocLiteralWrappedPort: {
          myMethod: function (args, cb, soapHeader) {
            throw {
              Fault: {
                Code: {
                  Value: "soap:Sender",
                  Subcode: { Value: "rpc:BadArguments" }
                },
                Reason: { Text: "Processing Error" },
                Detail:
                {myMethodFault2:
                   {errorMessage2: 'MyMethod Business Exception message', value2: 10}
                }
              }
            }
          }
        }
      }
    }
```


Examples of  SOAP 1.1/SOAP 1.2 Fault response can be found in test [test/server-client-document-test](https://github.com/strongloop/strong-soap/tree/master/test/server-client-document-test.js)

### Server security example using PasswordDigest

If `server.authenticate` is not defined then no authentication will take place.

``` javascript
  server = soap.listen(...)
  server.authenticate = function(security) {
    var created, nonce, password, user, token;
    token = security.UsernameToken, user = token.Username,
            password = token.Password, nonce = token.Nonce, created = token.Created;
    return user === 'user' && password === soap.passwordDigest(nonce, created, 'password');
  };
```

### Server connection authorization

The `server.authorizeConnection` method is called prior to the soap service method.
If the method is defined and returns `false` then the incoming connection is
terminated.

``` javascript
  server = soap.listen(...)
  server.authorizeConnection = function(req) {
    return true; // or false
  };
```


## SOAP Headers

### Received SOAP Headers

A service method can look at the SOAP headers by providing a 3rd arguments.

``` javascript
  {
      HeadersAwareFunction: function(args, cb, headers) {
          return {
              name: headers.Token
          };
      }
  }
```

It is also possible to subscribe to the 'headers' event.
The event is triggered before the service method is called, and only when the
SOAP Headers are not empty.

``` javascript
  server = soap.listen(...)
  server.on('headers', function(headers, methodName) {
    // It is possible to change the value of the headers
    // before they are handed to the service method.
    // It is also possible to throw a SOAP Fault
  });
```

First parameter is the Headers object;
second parameter is the name of the SOAP method that will called
(in case you need to handle the headers differently based on the method).

### Outgoing SOAP Headers

Both client & server can define SOAP headers that will be added to what they send.
They provide the following methods to manage the headers.


#### *addSoapHeader*(value, qname) - add soapHeader to soap:Header node
##### Parameters
  - `value` JSON object representing {headerName: headerValue} or XML string. 
  - `qname` qname used for the header

```
addSoapHeader(value, qname, options);

```

##### Returns
The index where the header is inserted.

#### *  changeSoapHeader(index, value, qname) - change an already existing soapHeader
##### Parameters
  - `index` index of the header to replace with provided new value
  - `value` JSON object representing {headerName: headerValue} or XML string. 
  - `qname` qname used for the header

#### *getSoapHeaders*() - return all defined headers

#### *clearSoapHeaders*() - remove all defined headers

SOAP header API usage can be found in [test/server-test](https://github.com/strongloop/strong-soap/tree/master/test/server-test.js) or [test/server-test](https://github.com/strongloop/strong-soap/tree/master/test/client-test.js)

## soap-stub

Unit testing services that use soap clients can be very cumbersome.  In order to get
around this you can use `soap-stub` in conjunction with `sinon` to stub soap with
your clients.

### Example

```javascript
// test-initialization-script.js
var sinon = require('sinon');
var soapStub = require('soap/soap-stub');

var urlMyApplicationWillUseWithCreateClient = 'http://path-to-my-wsdl';
var clientStub = {
  SomeOperation: sinon.stub()
};

clientStub.SomeOperation.respondWithError = soapStub.createRespondingStub({..error json...});
clientStub.SomeOperation.respondWithSuccess = soapStub.createRespondingStub({..success json...});

soapStub.registerClient('my client alias', urlMyApplicationWillUseWithCreateClient, clientStub);

// test.js
var soapStub = require('soap/soap-stub');

describe('myService', function() {
  var clientStub;
  var myService;

  beforeEach(function() {
    clientStub = soapStub.getStub('my client alias');
    soapStub.reset();
    myService.init(clientStub);
  });

  describe('failures', function() {
    beforeEach(function() {
      clientStub.SomeOperation.respondWithError();
    });

    it('should handle error responses', function() {
      myService.somethingThatCallsSomeOperation(function(err, response) {
        // handle the error response.
      });
    });
  });
});
```


## Contributors

 * [All Contributors](https://github.com/strongloop/strong-soap/graphs/contributors)

