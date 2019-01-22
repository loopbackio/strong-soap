'use strict';

var fs = require('fs'),
    soap = require('..').soap,
    http = require('http'),
    assert = require('assert');

describe('SOAP Client', function() {
  describe('with enforce restrictions option as true', function () {
    var server = null;
    var hostname = '127.0.0.1';
    var port = 0;


    before(function (done) {
      server = http.createServer(function (req, res) {
        res.statusCode = 200;
        fs.createReadStream(__dirname + '/soap-failure.xml').pipe(res);
      }).listen(port, hostname, done);
    });

    after(function (done) {
      server.close();
      server = null;
      done();
    });

    it('should NOT throw if the values don\'t match the restrictions', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        client.on('message', function (xml) {
          const expectedXml = '<soap:Body>\n' +
            '  <ns1:RestrictionRequest xmlns:ns1="http://www.Restriction.com/Types">\n' +
            '    <ns1:boolean>true</ns1:boolean>\n' +
            '    <ns1:boolean2>true</ns1:boolean2>\n' +
            '    <ns1:minExclusive>6</ns1:minExclusive>\n' +
            '    <ns1:minInclusive>5</ns1:minInclusive>\n' +
            '    <ns1:maxExclusive>4</ns1:maxExclusive>\n' +
            '    <ns1:maxInclusive>5</ns1:maxInclusive>\n' +
            '    <ns1:fractionDigits>12.1</ns1:fractionDigits>\n' +
            '    <ns1:fractionDigits2>12</ns1:fractionDigits2>\n' +
            '    <ns1:totalDigits>-2234</ns1:totalDigits>\n' +
            '    <ns1:totalDigits2>-1025</ns1:totalDigits2>\n' +
            '    <ns1:length>12345</ns1:length>\n' +
            '    <ns1:maxLength>abc</ns1:maxLength>\n' +
            '    <ns1:minLength>abcdef</ns1:minLength>\n' +
            '    <ns1:whiteSpaceReplace>  abc    ced   </ns1:whiteSpaceReplace>\n' +
            '    <ns1:whiteSpaceCollapse>abc ced</ns1:whiteSpaceCollapse>\n' +
            '    <ns1:pattern>12345678</ns1:pattern>\n' +
            '    <ns1:enumeration1>validValue1</ns1:enumeration1>\n' +
            '    <ns1:enumeration2>validValue2</ns1:enumeration2>\n' +
            '    <ns1:enumeration3>validValue2</ns1:enumeration3>\n' +
            '  </ns1:RestrictionRequest>\n' +
            '</soap:Body>\n';
          assert.equal(xml, expectedXml);
          done();
        });

        client.TestRestrictions({
          RestrictionRequest: {
            boolean: 'true',
            boolean2: true,
            minExclusive: 6,
            minInclusive: 5,
            maxExclusive: 4,
            maxInclusive: 5,
            fractionDigits: 12.1,
            fractionDigits2: '12',
            totalDigits: '-2234',
            totalDigits2: -1025,
            length: '12345',
            maxLength: 'abc',
            minLength: 'abcdef',
            whiteSpaceReplace: ' \nabc\r\n\t ced   ',
            whiteSpaceCollapse: ' \nabc\r\r  \n\t \n \t ced   ',
            pattern: '12345678',
            enumeration1: 'validValue1',
            enumeration2: 'validValue2',
            enumeration3: 'validValue2',
          }
        }, function () { });
      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the minExclusive doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);

        try {
          client.TestRestrictions({
            RestrictionRequest: {
              minExclusive: 5
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MinExclusiveType cannot have value 5 due to the violations: ["value is less or equal than minExclusive (5 <= 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the minInclusive doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              minInclusive: 4,
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MinInclusiveType cannot have value 4 due to the violations: ["value is less than minInclusive (4 < 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the maxExclusive doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              maxExclusive: 5
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MaxExclusiveType cannot have value 5 due to the violations: ["value is greater or equal than maxExclusive (5 >= 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the maxInclusive doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              maxInclusive: 6
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MaxInclusiveType cannot have value 6 due to the violations: ["value is greater than maxInclusive (6 > 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the fractionDigits doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              fractionDigits: '12.123'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field FractionDigitsType cannot have value 12.123 due to the violations: ["value has more decimal places than allowed (3 > 1)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the totalDigits with a string doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              totalDigits: '12345'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field TotalDigitsType cannot have value 12345 due to the violations: ["value has more digits than allowed (5 > 4)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the totalDigits with an integer doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              totalDigits: 12345
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field TotalDigitsType cannot have value 12345 due to the violations: ["value has more integer digits than allowed (5 > 4)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the totalDigits with a decimal doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              totalDigits: '1234.2'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field TotalDigitsType cannot have value 1234.2 due to the violations: ["value has more digits than allowed (5 > 4)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the length doesn\'t match its restriction (bigger than)', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              length: '123456'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field LengthType cannot have value 123456 due to the violations: ["lengths don\'t match (6 != 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the length doesn\'t match its restriction (smaller than)', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              length: '1234'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field LengthType cannot have value 1234 due to the violations: ["lengths don\'t match (4 != 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the maxLength doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              maxLength: 'abcdef'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MaxLengthType cannot have value abcdef due to the violations: ["length is bigger than maxLength (6 > 5)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the minLength doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              minLength: 'ab'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field MinLengthType cannot have value ab due to the violations: ["length is smaller than minLength (2 < 4)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the pattern doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              pattern: 'abcdef'
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field PatternType cannot have value abcdef due to the violations: ["value doesn\'t match the required pattern (abcdef !match [0-9]{8})"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

    it('should throw if the enumeration doesn\'t match its restriction', function (done) {
      soap.createClient(__dirname + '/wsdl/restrictions.wsdl', { enforceRestrictions: true }, function (err, client) {
        assert.equal(err, null);
        try {
          client.TestRestrictions({
            RestrictionRequest: {
              enumeration1: 'validValue1',
              enumeration2: 'InvalidValue',
              enumeration3: 'validValue2',
            }
          }, function () {
            done('It should have thrown error');
          });
        } catch (err) {
          assert.equal(err.message, 'The field EnumerationType cannot have value InvalidValue due to the violations: ["value is not in the list of valid values (InvalidValue is not in validValue1,validValue2)"]');
          done();
        }

      }, 'http://' + hostname + ":" + server.address().port);
    });

  });

});
