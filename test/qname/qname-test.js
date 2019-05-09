// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var QName = require('../../index').QName;
var should = require('should');

describe('QName', function() {
  describe('constructor', function() {
    it('should allow local name', function() {
      var qname = new QName('x');
      qname.name.should.eql('x');
      qname.nsURI.should.eql('');
      qname.prefix.should.eql('');
    });

    it('should allow qualified name', function() {
      var qname = new QName('x:y');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('');
      qname.prefix.should.eql('x');
    });

    it('should allow fully qualified name', function() {
      var qname = new QName('{http://example.com}x:y');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('http://example.com');
      qname.prefix.should.eql('x');
    });

    it('should allow fully qualified name without prefix', function() {
      var qname = new QName('{http://example.com}y');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('http://example.com');
      qname.prefix.should.eql('');
    });

    it('should not allow malformed nsURI', function() {
      should.throws(function() {
        var qname = new QName('{http://example.comy');
      });
    });

    it('should not allow malformed name', function() {
      should.throws(function() {
        var qname = new QName(':y');
        console.log(qname);
      });
    });

  });

  describe('parse', function() {
    it('should allow local name', function() {
      var qname = QName.parse('x');
      qname.name.should.eql('x');
      qname.nsURI.should.eql('');
      qname.prefix.should.eql('');
    });

    it('should allow qualified name', function() {
      var qname = QName.parse('x:y');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('');
      qname.prefix.should.eql('x');
    });

    it('should allow fully qualified name', function() {
      var qname = QName.parse('{http://example.com}x:y');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('http://example.com');
      qname.prefix.should.eql('x');
    });

    it('should allow name and uri', function() {
      var qname = QName.parse('x:y', 'http://example.com');
      qname.name.should.eql('y');
      qname.nsURI.should.eql('http://example.com');
      qname.prefix.should.eql('x');
    });

    it('should allow name and uri function', function() {
      var qname = QName.parse('x:y', {
        getNamespaceURI(prefix) {
          return 'http://example.com';
        }
      });
      qname.name.should.eql('y');
      qname.nsURI.should.eql('http://example.com');
      qname.prefix.should.eql('x');
    });

  });

});
