'use strict';

var fs = require('fs'),
    soap = require('..').soap,
    http = require('http'),
    WSDL = soap.WSDL,
    assert = require('assert'),
    QName = require('..').QName;

describe('wsdl-attributegroup-refs-test', function() {

  var server = null;
  var hostname = '127.0.0.1';
  var port = 0;

  before(function(done) {
    server = http.createServer(function (req, res) {
      res.statusCode = 200;
      res.write(JSON.stringify({tempResponse: 'temp'}), 'utf8');
      res.end();
    }).listen(port, hostname, done);
  });

  after(function(done) {
    server.close();
    server = null;
    done();
  });

  it('should prefix namespaced attributes from an attributeGroup ref', function (done) {
    soap.createClient(__dirname + '/wsdl/attributegroup_ref.wsdl', function (err, client) {
      assert.ok(client);
      var data = {
          DummyRequest: {
              Id: 1,
              Option: { $attributes: { toBeNamespaced: '0', notNamespaced: '1' } },
          }
      };
      /* In the previous implementation the result was:
        ...<Option toBeNamespaced="0" notNamespaced="1"/>
        Because attribute definitions were missing from the request descriptor. Updated to generate below:
        ...<Option xmlns:ns2="http://www.dummy.example.org/dummy.xsd" ns2:toBeNamespaced="0" notNamespaced="1"/>
      */
      client['MyService']['MyServicePort']['GetDummy'](data, function(err, result) {
        assert.ok(client.lastRequest);
        assert.ok(client.lastMessage);
        assert.ok(client.lastEndpoint);
        assert.ok(client.lastMessage.includes(':toBeNamespaced="0"'));
        assert.ok(client.lastMessage.includes(' notNamespaced="1"'));
        done();
        return;
      });
    }, 'http://' + hostname + ':' + server.address().port);
  });

});
