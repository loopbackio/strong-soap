'use strict';

var fs = require('fs');
var openWSDL = require('..').WSDL.open;
var assert = require('assert');
var http = require('http');

describe(__filename, function () {
  let server = null;
  let hostname = '127.0.0.1';
  let port = 0;


  before(function (done) {
    server = http.createServer(function (req, res) {
      switch (req.url) {
        case '/wsdl.xml':
          res.writeHead(301, {
            'Location': '/moved/here/wsdl.xml'
          });
          res.end();
          break;
        case '/moved/here/wsdl.xml':
          const wsdlStream = fs.createReadStream(__dirname + '/wsdl/Dummy.wsdl');
          wsdlStream.pipe(res);
          break;
        case '/moved/here/Common.xsd':
          const schemaStream = fs.createReadStream(__dirname + '/wsdl/Common.xsd');
          schemaStream.pipe(res);
          break
        case '/moved/here/Name.xsd':
          const schemaStream2 = fs.createReadStream(__dirname + '/wsdl/Name.xsd');
          schemaStream2.pipe(res);
          break;
        default:
          res.writeHead(500);
          res.end();
      }
    }).listen(port, hostname, done);
  });

  after(function (done) {
    server.close();
    server = null;
    done();
  });

  it('should parse WSDL from redirected location', function (done) {
    const { address, port } = server.address();

    openWSDL(
      `http://${address}:${port}/wsdl.xml`,
      function (err, def) {
        assert.ok(!err);
        const { schemas } = def.definitions;
        assert.deepEqual(Object.keys(schemas), [
          'undefined',
          'http://www.Dummy.com/Common/Types',
          'http://www.Dummy.com/Name/Types'
        ]);
        done();
      }
    );
  });
});
