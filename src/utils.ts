// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import crypto from 'crypto';

export const passwordDigestOriginal = function passwordDigest(nonce: string, created: string, password: string) {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = Buffer.from(nonce || '', 'base64').toString('binary');
  pwHash.update(rawNonce + created + password);
  return pwHash.digest('base64');
};

export function passwordDigest(nonce: string, created: string, password: string): string {
  // digest = base64 ( sha1 ( nonce + created + password ) )
  var pwHash = crypto.createHash('sha1');
  var rawNonce = Buffer.from(nonce || '', 'base64');
  pwHash.update(Buffer.concat([
    rawNonce,
    Buffer.from(created),
    Buffer.from(password)
  ]));
  return pwHash.digest('base64');
};

export const TNS_PREFIX = '' // Prefix for targetNamespace

/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
export function findPrefix<T extends Record<string, string>>(xmlnsMapping: T, nsURI: string): keyof T | void {
  for (var n in xmlnsMapping) {
    if (n === TNS_PREFIX) continue;
    if (xmlnsMapping[n] === nsURI) {
      return n;
    }
  }
};

export function extend(base, obj) {
  if (base !== null && typeof base === "object" &&
    obj !== null && typeof obj === "object") {
    Object.keys(obj).forEach(function(key) {
      if (!base.hasOwnProperty(key))
        base[key] = obj[key];
    });
  }
  return base;
};

export function toXMLDate(d: Date): string {
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

export function createPromiseCallback() {
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

