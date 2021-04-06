// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('./lib/globalize');
var _ = require('lodash');

var aliasedClientStubs = {};
var clientStubs = {};

/**
 * This module stubs the soap module to allow for offline
 * testing and stubbed clients.  All clients' methods are stubbed with sinon and have
 * additional functionality:
 *
 * <ul>
 * <li>.respondWithError() - Responds with the mocked client's sample error response.</li>
 * <li>.respondWithSuccess() - Responds with the mocked client's sample success response.</li>
 * </ul>
 *
 * Register a client by calling `.registerClient(urlToWsdl, clientStub)`.  For an
 * example client stub, see ./soap-stub-client-example.js.
 *
 * @property {Boolean} errOnCreateClient returns an error to the createClient method when set to true.
 */
module.exports = {
  createClient: createClient,
  createErroringStub: createErroringStub,
  createErroringStubAsync: createErroringStubAsync,
  createRespondingStub: createRespondingStub,
  createRespondingStubAsync: createRespondingStubAsync,
  errOnCreateClient: false,
  getStub: getStub,
  registerClient: registerClient,
  reset: reset
};

/**
 * Return a stubbed client based on the value of wsdlUrl.
 *
 * @throws if wsdlUrl is unknown.
 *
 * @param {String} wsdlUrl
 * @param {Object} options
 * @param {Function} cb
 * @return {Object}
 */
function createClient(wsdlUrl, options, cb) {
  if (!cb) {
    cb = options;
    options = {};
  }

  if (this.errOnCreateClient) {
    return setTimeout(cb.bind(null, new Error(g.f('forced error on {{createClient}}'))));
  }

  var client = getStub(wsdlUrl);

  if (client) {
    resetStubbedMethods(client);
    setTimeout(cb.bind(null, null, client));
  } else {
    setTimeout(cb.bind(null, new Error(g.f('no client stubbed for %s', wsdlUrl))));
  }
}

/**
 * Returns a method that calls all callbacks given to the method it is attached
 * to with the given error.
 *
 * <pre>
 * myClientStub.someMethod.errorOnCall = createErroringStub(error);
 *
 * // elsewhere
 *
 * myClientStub.someMethod.errorOnCall();
 * </pre>
 *
 * @param {?} object anything
 * @return {Function}
 */
function createErroringStub(err) {
  return function() {
    this.args.forEach(function(argSet) {
      setTimeout(argSet[1].bind(null, err));
    });
    this.yields(err);
  };
}

/**
 * Returns a method that rejects all promises given to the method it is attached
 * to with the given error.
 *
 * <pre>
 * myClientStub.someMethod.errorOnCall = createErroringStubAsync(error);
 *
 * // elsewhere
 *
 * myClientStub.someMethod.errorOnCall();
 * </pre>
 *
 * @param {?} object anything
 * @return {Function}
 */
function createErroringStubAsync(err) {
  return function() {
    this.args.forEach(function(argSet) {
      setTimeout(argSet[1].bind(null, err));
    });
    this.rejects(err);
  };
}

/**
 * Returns a method that calls all callbacks given to the method it is attached
 * to with the given response.
 *
 * <pre>
 * myClientStub.someMethod.respondWithError = createRespondingStub(errorResponse);
 *
 * // elsewhere
 *
 * myClientStub.someMethod.respondWithError();
 * </pre>
 *
 * @param {?} object anything
 * @return {Function}
 */
function createRespondingStub(object) {
  return function() {
    this.args.forEach(function(argSet) {
      setTimeout(argSet[1].bind(null, null, object));
    });
    this.yields(null, object);
  };
}

/**
 * Returns a method that resolves all promises given to the method it is attached
 * to with the given response.
 *
 * <pre>
 * myClientStub.someMethod.respondWithError = createRespondingStubAsync(errorResponse);
 *
 * // elsewhere
 *
 * myClientStub.someMethod.respondWithError();
 * </pre>
 *
 * @param {?} object anything
 * @return {Function}
 */
function createRespondingStubAsync(object) {
  return function() {
    this.args.forEach(function(argSet) {
      setTimeout(argSet[1].bind(null, null, object));
    });
    this.resolves(object);
  };
}

/**
 * Registers a stubbed client with soap-stub.  urlToWsdl is the path you will use
 * in your app.
 *
 * @param {String} alias A simple name to refer to the clientStub as.
 * @param {String} urlToWsdl May be file system URL or http URL.
 * @param {Object} clientStub A client with stubbed methods.
 */
function registerClient(alias, urlToWsdl, clientStub) {
  aliasedClientStubs[alias] = clientStub;
  clientStubs[urlToWsdl] = clientStub;
}

/**
 * Resets state associated with clientStubs.
 */
function reset() {
  _.forEach(clientStubs, resetStubbedMethods);
  this.errOnCreateClient = false;
}

/**
 * Returns a previously registered client stub.
 *
 * @param {String} aliasOrWsdlUrl
 * @return {Object} clientStub
 */
function getStub(aliasOrWsdlUrl) {
  return aliasedClientStubs[aliasOrWsdlUrl] || clientStubs[aliasOrWsdlUrl];
}

function resetStubbedMethods(client) {
  Object.keys(client).forEach(function(method) {
    method = client[method];
    if (typeof method === 'function' && typeof method.reset === 'function') {
      method.reset();
    }
  });
}
