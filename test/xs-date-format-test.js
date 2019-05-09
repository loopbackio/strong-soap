// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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

  describe('xml date/time/dateTime', function () {
    // 2019-03-27T04:01:01.000Z
    var inputDate = new Date('2019-03-27T01:01:01-03:00');
    var inputDateStr = new Date('2019-03-27T01:01:01-03:00');

    it('converts date to xml date', function () {
      var xmlDate = xmlHandler.toXmlDate(inputDate);
      assert.equal(xmlDate, '2019-03-27Z');
    });

    it('converts date to xml time', function () {
      var xmlTime = xmlHandler.toXmlTime(inputDate);
      assert.equal(xmlTime, '04:01:01.000Z');
    });

    it('converts date to xml dateTime', function () {
      var xmlDateTime = xmlHandler.toXmlDateTime(inputDate);
      assert.equal(xmlDateTime, '2019-03-27T04:01:01.000Z');
    });

    it('converts string to xml date', function () {
      var xmlDate = xmlHandler.toXmlDate(inputDateStr);
      assert.equal(xmlDate, '2019-03-27Z');
    });

    it('converts string to xml time', function () {
      var xmlTime = xmlHandler.toXmlTime(inputDateStr);
      assert.equal(xmlTime, '04:01:01.000Z');
    });

    it('converts string to xml dateTime', function () {
      var xmlDateTime = xmlHandler.toXmlDateTime(inputDateStr);
      assert.equal(xmlDateTime, '2019-03-27T04:01:01.000Z');
    });
  });
  
});
