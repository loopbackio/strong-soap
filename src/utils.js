'use strict';

var crypto = require('crypto');
exports.passwordDigestOriginal = function passwordDigest(nonce, created, password) {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = new Buffer(nonce || '', 'base64').toString('binary');
  pwHash.update(rawNonce + created + password);
  return pwHash.digest('base64');
};

exports.passwordDigest = function (nonce, created, password) {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = new Buffer(nonce || '', 'base64');
  pwHash.update(Buffer.concat([
    rawNonce,
    new Buffer(created),
    new Buffer(password)
  ]));
  return pwHash.digest('base64');
};

var TNS_PREFIX = ''; // Prefix for targetNamespace

exports.TNS_PREFIX = TNS_PREFIX;

/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
exports.findPrefix = function(xmlnsMapping, nsURI) {
  for (var n in xmlnsMapping) {
    if (n === TNS_PREFIX) continue;
    if (xmlnsMapping[n] === nsURI) {
      return n;
    }
  }
};

exports.extend = function extend(base, obj) {
  if (base !== null && typeof base === "object" &&
    obj !== null && typeof obj === "object") {
    Object.keys(obj).forEach(function(key) {
      if (!base.hasOwnProperty(key))
        base[key] = obj[key];
    });
  }
  return base;
};

exports.toXMLDate = function(d) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  return d.getUTCFullYear() + '-'
    + pad(d.getUTCMonth() + 1) + '-'
    + pad(d.getUTCDate()) + 'T'
    + pad(d.getUTCHours()) + ':'
    + pad(d.getUTCMinutes()) + ':'
    + pad(d.getUTCSeconds()) + 'Z';
};

exports.createPromiseCallback = function createPromiseCallback() {
  var cb;
  var promise = new Promise(function(resolve, reject) {
    cb = function(err, result, envelope, soapHeader) {
      if (err) {
        reject(err);
      } else {
        resolve({result, envelope, soapHeader});
      }
    }
  });
  cb.promise = promise;
  return cb;
}

