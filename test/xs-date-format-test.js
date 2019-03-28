"use strict";
var xmlHandler = require('./../src/parser/xmlHandler');
var assert = require('assert');

describe('xs-date-format-tests', function() {

  it('parses a xs:date string with negative tz offset', function () {
    var inputDate = '2019-03-27-06:00';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date('2019-03-27').toISOString(), 'expected parsed date');
  });

  it('parses a xs:date string with positive tz offset', function () {
    var inputDate = '2019-03-27+06:00';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date('2019-03-27').toISOString(), 'expected parsed date');
  });
  
  it('parses a xs:date string with Z at the end', function () {
    var inputDate = '2019-03-27Z';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date(inputDate).toISOString(), 'expected parsed date');
  });
  
  it('parses a xs:date string without tz', function () {
    var inputDate = '2019-03-27';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date(inputDate).toISOString(), 'expected parsed date');
  });
  
  it('parses a xs:dateTime string with tz', function () {
    var inputDate = '2019-03-27T01:01:01-03:00';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date(inputDate).toISOString(), 'expected parsed date');
  });
  
  it('parses a xs:dateTime string without tz', function () {
    var inputDate = '2019-03-27T01:01:01';
    var parsed = xmlHandler.parseValue(inputDate, {jsType: Date});
    assert.equal(parsed.toISOString(), new Date(inputDate).toISOString(), 'expected parsed date');
  });
  
});
