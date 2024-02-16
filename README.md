# strong-soap

[![CI](https://github.com/loopbackio/strong-soap/actions/workflows/continuous-integration.yaml/badge.svg)](https://github.com/loopbackio/strong-soap/actions/workflows/continuous-integration.yaml)
[![Build Status](https://app.travis-ci.com/loopbackio/strong-soap.svg?branch=master)](https://app.travis-ci.com/loopbackio/strong-soap)
[![Coverage Status](https://coveralls.io/repos/github/loopbackio/strong-soap/badge.svg?branch=master)](https://coveralls.io/github/loopbackio/strong-soap?branch=master)

This module provides a Node.js SOAP client for invoking web services and a mock-up SOAP server capability to create and test your web service. This module is based on `node-soap` module.

<!-- Run `npm run toc` to update below section -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
- [Install](#install)
- [Client](#client)
  - [Extra headers (optional)](#extra-headers-optional)
  - [Client.describe()](#clientdescribe)
  - [Client.setSecurity(security)](#clientsetsecuritysecurity)
  - [Client.*method*(args, callback)](#clientmethodargs-callback)
  - [Client.*service*.*port*.*method*(args, callback[, options[, extraHeaders]])](#clientserviceportmethodargs-callback-options-extraheaders)
  - [Client.*lastRequest*](#clientlastrequest)
  - [Client.setEndpoint(url)](#clientsetendpointurl)
  - [Client Events](#client-events)
  - [Security](#security)
  - [BasicAuthSecurity](#basicauthsecurity)
  - [BearerSecurity](#bearersecurity)
  - [ClientSSLSecurity](#clientsslsecurity)
  - [WSSecurity](#wssecurity)
  - [WSSecurityCert](#wssecuritycert)
- [XML Attributes](#xml-attributes)
  - [Handling XML Attributes, Value and XML (wsdlOptions)](#handling-xml-attributes-value-and-xml-wsdloptions)
  - [Overriding the value key](#overriding-the-value-key)
  - [Overriding the xml key](#overriding-the-xml-key)
  - [Overriding the `attributes` key](#overriding-the-attributes-key)
- [XMLHandler](#xmlhandler)
- [WSDL](#wsdl)
  - [wsdl.open(wsdlURL, options, callback(err, wsdl))](#wsdlopenwsdlurl-options-callbackerr-wsdl)
- [Server](#server)
  - [soap.listen(*server*, *path*, *services*, *wsdl*)](#soaplistenserver-path-services-wsdl)
  - [Options](#options)
  - [Server logging](#server-logging)
  - [Server events](#server-events)
  - [SOAP Fault](#soap-fault)
  - [Server security example using PasswordDigest](#server-security-example-using-passworddigest)
  - [Server connection authorization](#server-connection-authorization)
- [SOAP headers](#soap-headers)
  - [Received SOAP headers](#received-soap-headers)
  - [Outgoing SOAP headers](#outgoing-soap-headers)
- [soap-stub](#soap-stub)
  - [Example](#example)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

Features:

* Full SOAP Client capability and mock-up SOAP server capability
* Handles both RPC and Document styles
* Handles both SOAP 1.1 and SOAP 1.2 Fault
* APIs to parse XML into JSON and JSON into XML
* API to describe WSDL document
* Support for both synchronous and asynchronous method handlers
* WS-Security (currently only UsernameToken and PasswordText encoding is supported)

## Install

Node.js version 10, 12, and 14 are officially supported. We dropped version 8
support in 3.0.0.

Install with [npm](http://github.com/isaacs/npm):

```sh
npm install strong-soap
```

## Client

Start with the WSDL for the web service you want to invoke. For example, the stock quote service http://www.webservicex.net/stockquote.asmx and the WSDL is http://www.webservicex.net/stockquote.asmx?WSDL

Create a new SOAP client from WSDL URL using `soap.createClient(url[, options], callback)`. Also supports a local file system path. An instance of `Client` is passed to the `soap.createClient` callback.  It is used to execute methods on the soap service.

```js
"use strict";

var soap = require('strong-soap').soap;
// wsdl of the web service this client is going to invoke. For local wsdl you can use, url = './wsdls/stockquote.wsdl'
var url = 'http://www.webservicex.net/stockquote.asmx?WSDL';

var requestArgs = {
  symbol: 'IBM'
};

var options = {};
soap.createClient(url, options, function(err, client) {
  var method = client['StockQuote']['StockQuoteSoap']['GetQuote'];
  method(requestArgs, function(err, result, envelope, soapHeader) {
    //response envelope
    console.log('Response Envelope: \n' + envelope);
    //'result' is the response body
    console.log('Result: \n' + JSON.stringify(result));
  });
});

```

As well as creating a client via a `url`, an existing [WSDL](#wsdl) object can be passed in via `options.WSDL_CACHE`.

```js
var soap = require('strong-soap').soap;
var WSDL = soap.WSDL;

var url = 'http://www.webservicex.net/stockquote.asmx?WSDL';

// Pass in WSDL options if any

var options = {};
WSDL.open(url,options,
  function(err, wsdl) {
    // You should be able to get to any information of this WSDL from this object. Traverse
    // the WSDL tree to get  bindings, operations, services, portTypes, messages,
    // parts, and XSD elements/Attributes.

    // Set the wsdl object in the cache. The key (e.g. 'stockquotewsdl')
    // can be anything, but needs to match the parameter passed into soap.createClient()
    var clientOptions = {
      WSDL_CACHE : {
        stockquotewsdl: wsdl
      }
    };
    soap.createClient('stockquotewsdl', clientOptions, function(err, client) {
      var method = client['StockQuote']['StockQuoteSoap']['GetQuote'];
      method(requestArgs, function(err, result, envelope, soapHeader) {

      //response envelope
      console.log('Response Envelope: \n' + envelope);
      //'result' is the response body
      console.log('Result: \n' + JSON.stringify(result));
    });
  });
});
```


The Request envelope created by above service invocation:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ns1:GetQuote xmlns:ns1="http://www.webserviceX.NET/">
      <ns1:symbol>IBM</ns1:symbol>
    </ns1:GetQuote>
  </soap:Body>
</soap:Envelope>
```

This WSDL operation is defined as document/literal-wrapped style. Hence the request in soap <Body> is wrapped in operation name. Refer to test cases [server-client-document-test](https://github.com/loopbackio/strong-soap/blob/master/test/server-client-document-test.js) and  [server-client-rpc-test](https://github.com/loopbackio/strong-soap/blob/master/test/server-client-rpc-test.js) to understand document and rpc styles and their
Request, Response and Fault samples.

The `options` argument allows you to customize the client with the following properties:

- `endpoint`: to override the SOAP service's host specified in the `.wsdl` file.
- `request`: to override the [request](https://github.com/request/request) module.
- `httpClient`: to provide your own http client that implements `request(rurl, data, callback, exheaders, exoptions)`.
- `envelopeKey`: to set specific key instead of <pre><<b>soap</b>:Body></<b>soap</b>:Body></pre>
- `wsdl_options`: custom options for the request module on WSDL requests.
- `wsdl_headers`: custom HTTP headers to be sent on WSDL requests.

Note: for versions of node >0.10.X, you may need to specify `{connection: 'keep-alive'}` in SOAP headers to avoid truncation of longer chunked responses.

### Extra headers (optional)

User can define extra HTTP headers to be sent on the request.

```js
var clientOptions = {};
soap.createClient(url, clientOptions, function(err, client) {
  var customRequestHeader = {customheader1: 'test1'};
  // Custom request header
  client.GetQuote(requestArgs, function(err, result, envelope) {
    // Result in SOAP envelope body which is the wrapper element.
    // In this case, result object corresponds to GetCityForecastByZIPResponse.
    console.log(JSON.stringify(result));
  }, null, customRequestHeader);
});
```

### Client.describe()

Describes services, ports and methods as a JavaScript object.

```js
// Describes the entire WSDL in a JSON tree object form.
var description = client.describe();
// Inspect GetQuote operation. You can inspect Service: {Port: {operation: {
console.log(JSON.stringify(description.StockQuote.StockQuoteSoap.GetQuote));
```

### Client.setSecurity(security)

Use the specified security protocol.

Refer to test case [ssl-test](https://github.com/loopbackio/strong-soap/blob/master/test/ssl-test.js) for an example of using this API.

### Client.*method*(args, callback)

Call *method* on the SOAP service.

```js
  client.MyFunction({name: 'value'}, function(err, result, envelope, soapHeader) {
      // Result is a javascript object
      // Envelope is the response envelope from the Web Service
      // soapHeader is the response soap header as a JavaScript object
  })
```

A *method* can also be called as a promise.

```js
  client.MyFunction({name: 'value'}).then(function({result, envelope, soapHeader}){
    // ...
  }, function(err) {
    // ...
  });

  // in async/await flavor
  try {
    const {result, envelope, soapHeader} = await client.MyFunction({name: 'value'});
  } catch(err) {
    // handle error
  }
```

### Client.*service*.*port*.*method*(args, callback[, options[, extraHeaders]])

Call a *method* using a specific *service* and *port*.

```js
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // Result is a JavaScript object
  })
```

#### Options (optional)

 Accepts any option that the request module accepts, see [request](https://github.com/request/request) module.

 For example, you could set a timeout of 5 seconds on the request like this:

```js
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // result is a javascript object
  }, {timeout: 5000})
```

You can measure the elapsed time on the request by passing the time option:

```js
  client.MyService.MyPort.MyFunction({name: 'value'}, function(err, result) {
      // client.lastElapsedTime - the elapsed time of the last request in milliseconds
  }, {time: true})
```

#### Alternative method call using callback-last pattern

To align method call signature with Node's standard callback-last pattern and eventually allow promisification of method calls, the following method signatures are also supported:

```js
client.MyService.MyPort.MyFunction({name: 'value'}, options, function (err, result) {
  // result is a javascript object
})

client.MyService.MyPort.MyFunction({name: 'value'}, options, extraHeaders, function (err, result) {
  // result is a javascript object
})
```

### Client.*lastRequest*

The property that contains last full soap request for client logging.

### Client.setEndpoint(url)

Overwrites the SOAP service endpoint address.

### Client events
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

For an example of using this API, see  [ssl-test](https://github.com/loopbackio/strong-soap/blob/master/test/client-test.js).

Here is an example of 'soapError' event

```js
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
as well.  The interface is quite simple. Each protocol defines two methods:

* `addOptions` - Method that accepts an options arg that is eventually passed directly to `request`
* `toXML` - Method that returns a string of XML.

### BasicAuthSecurity

```js
  client.setSecurity(new soap.BasicAuthSecurity('username', 'password'));
```

### BearerSecurity

```js
  client.setSecurity(new soap.BearerSecurity('token'));
```

### ClientSSLSecurity

_Note_: If you run into issues using this protocol, consider passing these options
as default request options to the constructor:
* `rejectUnauthorized: false`
* `strictSSL: false`
* `secureOptions: constants.SSL_OP_NO_TLSv1_2` (this is likely needed for node >= 10.0)

```js
  client.setSecurity(new soap.ClientSSLSecurity(
    '/path/to/key'
    , '/path/to/cert'
    , {/*default request options*/}
  ));
```

### WSSecurity

`WSSecurity` implements WS-Security. UsernameToken and PasswordText/PasswordDigest is supported.

```js
  var wsSecurity = new WSSecurity(username, password, options)
    //the 'options' object is optional and contains properties:
    //passwordType: 'PasswordDigest' or 'PasswordText' default is PasswordText
    //hasTimeStamp: true or false, default is true
    //hasTokenCreated: true or false, default is true
  client.setSecurity(wsSecurity);
```

### WSSecurityCert

WS-Security X509 Certificate support.

```js
  var privateKey = fs.readFileSync(privateKeyPath);
  var publicKey = fs.readFileSync(publicKeyPath);
  var password = ''; // optional password
  var wsSecurity = new soap.WSSecurityCert(privateKey, publicKey, password, 'utf8');
  client.setSecurity(wsSecurity);
```

_Note_: Optional dependency 'ursa' is required to be installed successfully when WSSecurityCert is used.

### ClientSSLSecurityPFX

```js
  const pfxSecurity = new soap.ClientSSLSecurityPFX(pathToPfxOrFileBuffer, passphrase)
  client.setSecurity(pfxSecurity)
```

## XML attributes

### Handling XML attributes, value, and XML (wsdlOptions)

To override the default behavior of `strong-soap`, use the `wsdlOptions` object, passed in the
`createClient()` method.  The `wsdlOptions` has the following properties:

```js
var wsdlOptions = {
  attributesKey: 'theAttrs',
  valueKey: 'theVal',
  xmlKey: 'theXml'
}
```

If you call `createClient()` with no options (or an empty Object `{}`),  `strong-soap` defaults
to the following:

- `attributesKey` : `'$attributes'`
- `valueKey` : `'$value'`
- `xmlKey` : `'$xml'`

### Overriding the value key

By default, `strong-soap` uses `$value` as key for any parsed XML value which may interfere with your other code as it
could be some reserved word, or the `$` in general cannot be used for a key to start with.

You can define your own `valueKey` by passing it in the `wsdl_options` to the createClient call like so:
```js
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

```js
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

You can define your own `xmlKey` by passing it in the `wsdl_options` to the createClient call like this:

```js
var wsdlOptions = {
  xmlKey: 'theXml'
};

soap.createClient(__dirname + '/wsdl/default_namespace.wsdl', wsdlOptions, function (err, client) {
  // your code
});
```

### Overriding the attributes key

You can achieve attributes like:

```xml
<parentnode>
  <childnode name="childsname">
  </childnode>
</parentnode>
```
By attaching an attributes object to a node.

```js
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
However, "attributes" may be a reserved key for some systems that actually want a node:

```xml
<attributes>
</attributes>
```

In this case you can configure the attributes key in the `wsdlOptions` like this:

```js
var wsdlOptions = {
  attributesKey: '$attributes'
};
```

Adding xsiType

```js
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

```js
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

To see it in practice, consider the sample in: [test/request-response-samples/addPets__force_namespaces](https://github.com/loopbackio/strong-soap/tree/master/test/request-response-samples/addPets__force_namespaces)

## XMLHandler

XMLHandler enables you to to convert a JSON object to XML and XML to a JSON object.  It can also parse an XML string or stream into the XMLBuilder tree.

API to convert JSON object to XML and XML to JSON object:

```js
var soap = require('..').soap;
var XMLHandler = soap.XMLHandler;
var xmlHandler = new XMLHandler();
var util = require('util');
var url = 'http://www.webservicex.net/stockquote.asmx?WSDL';

var requestArgs = {
  symbol: 'IBM'
};

var options = {};
var clientOptions = {};
soap.createClient(url, clientOptions, function(err, client) {
  var customRequestHeader = {customheader1: 'test1'};
  client.GetQuote(requestArgs, function(err, result, envelope, soapHeader) {
    // Convert 'result' JSON object to XML
    var node = xmlHandler.jsonToXml(null, null,
      XMLHandler.createSOAPEnvelopeDescriptor('soap'), result);
    var xml = node.end({pretty: true});
    console.log(xml);

    // Convert XML to JSON object
    var root = xmlHandler.xmlToJson(null, xml, null);
    console.log('%s', util.inspect(root, {depth: null}));

  }, options, customRequestHeader);
});
```

Parse XML string or stream into the XMLBuilder tree:

```js
var root = XMLHandler.parseXml(null, xmlString);
```

## WSDL

### wsdl.open(wsdlURL, options, callback(err, wsdl))

Loads WSDL into a tree form. Traverse through WSDL tree to get to bindings, services, ports, operations, and so on.

Parameters:

- `wsdlURL` WSDL url to load.
- `options` WSDL options
- `callback` Error and WSDL loaded into object tree.

```js
var soap = require('..').soap;
var WSDL = soap.WSDL;
var path = require('path');

// Pass in WSDL options if any

var options = {};
WSDL.open('./wsdls/stockquote.wsdl',options,
  function(err, wsdl) {
    // You should be able to get to any information of this WSDL from this object. Traverse
    // the WSDL tree to get  bindings, operations, services, portTypes, messages,
    // parts, and XSD elements/Attributes.

    var getQuoteOp = wsdl.definitions.bindings.StockQuoteSoap.operations.GetQuote;
    // print operation name
    console.log(getQuoteOp.$name);
    var service = wsdl.definitions.services['StockQuote'];
    //print service name
    console.log(service.$name);
});
```

### wsdl.openSync(wsdlURL, options)

Loads WSDL into a tree form directly from memory. It traverses through WSDL tree to get to bindings, services, ports, operations, and so on as long as you have your dependent WSDLs and schemas are loaded and available in the `options.WSDL_CACHE`. If any I/O is required to retrieve any dependencies this call will throw an error.

Parameters:

- `wsdlURL` WSDL url to load as named in the cache.
- `options` WSDL options

An example of loading WSDLs into your `options.WSDL_CACHE` and calling `wsdl.loadSync()` can be found in the test [test/wsdl-load-from-memory-test](https://github.com/loopbackio/strong-soap/tree/master/test/wsdl-load-from-memory-test.js)


## Server

### soap.listen(*server*, *path*, *services*, *wsdl*)

Creates a new SOAP server that listens on *path* and provides *services*.

*wsdl* is an xml string that defines the service.

```js
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
              reallyDetailedFunction: function(args, cb, headers, req) {
                  console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
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

An example of using the SOAP server is in [test/server-client-document-test](https://github.com/loopbackio/strong-soap/tree/master/test/server-client-document-test.js)

### Options

You can pass in server and [WSDL Options](#handling-xml-attributes-value-and-xml-wsdloptions)
using an options hash.

```js
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

### Server logging

If the `log` method is defined it will be called with 'received' and 'replied'
along with data.

```js
  server = soap.listen(...)
  server.log = function(type, data) {
    // type is 'received' or 'replied'
  };
```

### Server events

Server instances emit the following events:

* request - Emitted for every received messages.
  The signature of the callback is `function(request, methodName)`.
* headers - Emitted when the SOAP Headers are not empty.
  The signature of the callback is `function(headers, methodName)`.

The sequence order of the calls is `request`, `headers` and then the dedicated
service method.

```js
    test.soapServer.on('request', function requestManager(request, methodName) {
      assert.equal(methodName, 'GetLastTradePrice');
      done();
    });

```

An example of using the SOAP server is in [test/server-test](https://github.com/loopbackio/strong-soap/tree/master/test/server-test.js)

### SOAP Fault

A service method can reply with a SOAP Fault to a client by `throw`ing an
object with a `Fault` property.

Example SOAP 1.1 Fault:

```js
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

SOAP 1.2 Fault:

```js
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


Examples of  SOAP 1.1/SOAP 1.2 Fault response can be found in test [test/server-client-document-test](https://github.com/loopbackio/strong-soap/tree/master/test/server-client-document-test.js)

### Server security example using PasswordDigest

If `server.authenticate` is not defined then no authentication will take place.

```js
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

```js
  server = soap.listen(...)
  server.authorizeConnection = function(req) {
    return true; // or false
  };
```


## SOAP headers

### Received SOAP headers

A service method can look at the SOAP headers by providing a third arguments.

```js
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

```js
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

### Outgoing SOAP headers

Both client and server can define SOAP headers that will be added to what they send.
They provide the following methods to manage the headers.

#### addSoapHeader(value, qname)

Adds soapHeader to soap:Header node.

Parameters:

- `value` JSON object representing {headerName: headerValue} or XML string.
- `qname` qname used for the header

```
addSoapHeader(value, qname, options);
```

Returns the index where the header is inserted.

#### changeSoapHeader(index, value, qname)

Changes an existing soapHeader.

Parameters:

- `index` index of the header to replace with provided new value
- `value` JSON object representing {headerName: headerValue} or XML string.
- `qname` qname used for the header

#### getSoapHeaders()

Returns all defined headers.

#### clearSoapHeaders()

Removes all defined headers.

Examples of using SOAP header API are in: [test/server-test](https://github.com/loopbackio/strong-soap/tree/master/test/server-test.js) and  [test/server-test](https://github.com/loopbackio/strong-soap/tree/master/test/client-test.js)

## soap-stub

Unit testing services that use SOAP clients can be very cumbersome.  To get
around this you can use `soap-stub` in conjunction with `sinon` to stub soap with
your clients.

### Example

```js
var sinon = require('sinon');
var soapStub = require('strong-soap/soap-stub');

var urlMyApplicationWillUseWithCreateClient = './example/stockquote.wsdl';
var clientStub = {
  SomeOperation: sinon.stub()
};

clientStub.SomeOperation.respondWithError = soapStub.createRespondingStub({error: 'error'});
clientStub.SomeOperation.respondWithSuccess = soapStub.createRespondingStub({success: 'success'});
// or if you are using promises
clientStub.SomeOperation.respondWithError = soapStub.createRespondingStubAsync({error: 'error'});
clientStub.SomeOperation.respondWithSuccess = soapStub.createRespondingStubAsync({success: 'success'});


soapStub.registerClient('my client alias', urlMyApplicationWillUseWithCreateClient, clientStub);


var fs = require('fs'),
  assert = require('assert'),
  request = require('@cypress/request'),
  http = require('http'),
  lastReqAddress;

describe('myService', function() {
  var clientStub;
  var myService;

  beforeEach(function() {
    clientStub = soapStub.getStub('my client alias');
    soapStub.reset();
    myService = clientStub;
  });

  describe('failures', function() {
    beforeEach(function() {
      clientStub.SomeOperation.respondWithError();
    });

    it('should handle error responses', function() {
      myService.SomeOperation(function(err, response) {
        // handle the error response.
      });
    });
  });
});

```

## Contributors

 * [All Contributors](https://github.com/loopbackio/strong-soap/graphs/contributors)
