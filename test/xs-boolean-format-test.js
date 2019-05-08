"use strict";
var xmlHandler = require('./../src/parser/xmlHandler');
var assert = require('assert');

describe('xs-boolean-format-tests', function() {

  it('parses a xs:boolean string with literal \'true\'', function () {
    var inputBoolean = 'true';
    var parsed = xmlHandler.parseValue(inputBoolean, {jsType: Boolean});
    assert.equal(parsed, true, 'expected parsed boolean');
  });

  it('parses a xs:boolean string with literal \'false\'', function () {
    var inputBoolean = 'false';
    var parsed = xmlHandler.parseValue(inputBoolean, {jsType: Boolean});
    assert.equal(parsed, false, 'expected parsed boolean');
  });

  it('parses a xs:boolean string with literal \'1\'', function () {
    var inputBoolean = '1';
    var parsed = xmlHandler.parseValue(inputBoolean, {jsType: Boolean});
    assert.equal(parsed, true, 'expected parsed boolean');
  });

  it('parses a xs:boolean string with literal \'0\'', function () {
    var inputBoolean = '0';
    var parsed = xmlHandler.parseValue(inputBoolean, {jsType: Boolean});
    assert.equal(parsed, false, 'expected parsed boolean');
  });

});
