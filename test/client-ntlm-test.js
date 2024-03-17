// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict'

var soap = require('..').soap;
var NTLMSecurity = require('..').NTLMSecurity;
var assert = require('assert');

var express = require('express');
var ntlm = require('express-ntlm');

var ntlmServer;

var createGenericNTLMServer = function(postUrl, postResponse, done) {
  var app = express();

  app.use(ntlm({
    debug: function () {
      var args = Array.prototype.slice.apply(arguments);
      console.log('NTLM debug:' + args.toString());
    }
  }));

  app.post(postUrl, postResponse);

  ntlmServer = app.listen(8002, function() {
    console.log('createGenericNTLMServer: listening on port 8002');
    done()
  })
};

var cleanupGenericNTLMServer = function (done) {
  if (!ntlmServer) {
    return done()
  }
  ntlmServer.close(() => {
    console.log('Closed ntlm server');
    done()
  })
};


describe('NTLM Auth tests', function() {
  var clientNTLMUsername = 'myUser';
  var clientNTLMDomain = 'myDomain';
  var clientNTLMWorkstation = 'myWorkspace';
  var clientNTLMPassword = 'myPassword';

  before(function(done) {
    var ntlmQCQPost = function (request, response) {

      assert.equal(request.ntlm.UserName, clientNTLMUsername);
      assert.equal(request.ntlm.DomainName, clientNTLMDomain.toUpperCase());
      assert.equal(request.ntlm.Workstation, clientNTLMWorkstation.toUpperCase());

      var responseData = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Header/>\n  <soap:Body>\n    <ns1:TradePrice xmlns:ns1=\"http://example.com/stockquote.xsd\">\n      <price>19.56</price>\n    </ns1:TradePrice>\n  </soap:Body>\n</soap:Envelope>';

      response.end(responseData);
    }
    createGenericNTLMServer('/services/StockQuoteService', ntlmQCQPost, done);
  });

  after(cleanupGenericNTLMServer);

  it('should call ntlm endpoint', function(done) {
    var ntlmSec = new NTLMSecurity(clientNTLMUsername,
      clientNTLMPassword,
      clientNTLMDomain,
      clientNTLMWorkstation, false);

    var options = {};
    options.NTLMSecurity = ntlmSec;
    soap.createClient(__dirname+'/wsdl/strict/stockquote.wsdl', options, function(err, client) {
      if (err) {
        return done(err)
      }
      assert.ok(client);

      client.GetLastTradePrice({}, function(err, result) {
        if (err) {
          return done(err)
        }
        assert.deepEqual(result, {price: 19.56});
        done()
      }, null, {'test-header': 'test'});
    }, 'http://localhost:8002/services/StockQuoteService');
  });
});
