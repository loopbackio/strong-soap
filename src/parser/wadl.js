var debug = require('debug')('strong-soap:wadl');
var fs = require('fs');

var Application = require('./wadl/application');

var WSDL = require('./wsdl');
var g = require('../globalize');

var QName = require('./qname');
var Definitions = require('./wsdl/definitions');
var Schema = require('./xsd/schema');
var Types = require('./wsdl/types');
var Element = require('./element');

var sax = require('sax');
var HttpClient = require('./../http');
var assert = require('assert');

class WADL extends WSDL {

  static open(uri, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    // initialize cache when calling open directly
    var WSDL_CACHE = options.WSDL_CACHE || {};
    var request_headers = options.wsdl_headers;
    var request_options = options.wsdl_options;

    debug('wsdl open. request_headers: %j request_options: %j', request_headers, request_options);
    var wsdl;
    if (!/^https?:/.test(uri)) {
      debug('Reading file: %s', uri);
      fs.readFile(uri, 'utf8', function(err, definition) {
        if (err) {
          callback(err);
        }
        else {
          wsdl = new WADL(definition, uri, options);
          WSDL_CACHE[uri] = wsdl;
          wsdl.WSDL_CACHE = WSDL_CACHE;
          wsdl.load(callback);
        }
      });
    }
    else {
      var httpClient = options.httpClient || new HttpClient(options);
      httpClient.request(uri, null /* options */,
        function(err, response, definition) {
          if (err) {
            callback(err);
          } else if (response && response.statusCode === 200) {
            wsdl = new WADL(definition, uri, options);
            WSDL_CACHE[uri] = wsdl;
            wsdl.WSDL_CACHE = WSDL_CACHE;
            wsdl.load(callback);
          } else {
            callback(new Error(g.f('Invalid {{WSDL URL}}: %s\n\n\r Code: %s' +
              "\n\n\r Response Body: %j", uri, response.statusCode, response.body)));
          }
        }, request_headers, request_options);
    }

    return wsdl;
  }

  _parse(xml) {
    var self = this,
      p = sax.parser(true),
      stack = [],
      root = null,
      types = null,
      schema = null,
      options = self.options;

    p.onopentag = function(node) {
      debug('Start element: %j', node);
      var nsName = node.name;
      var attrs = node.attributes;

      var top = stack[stack.length - 1];
      var name;
      if (top) {
        try {
          top.startElement(stack, nsName, attrs, options);
        } catch (e) {
          debug("WSDL error: %s ", e.message);
          if (self.options.strict) {
            throw e;
          } else {
            stack.push(new Element(nsName, attrs, options));
          }
        }
      } else {
        name = QName.parse(nsName).name;
        if (name === 'definitions') {
          root = new Definitions(nsName, attrs, options);
          stack.push(root);
        } else if (name === 'schema') {
          // Shim a structure in here to allow the proper objects to be
          // created when merging back.
          root = new Definitions('definitions', {}, {});
          types = new Types('types', {}, {});
          schema = new Schema(nsName, attrs, options);
          types.addChild(schema);
          root.addChild(types);
          stack.push(schema);
        } else if (name === 'application') {
          root = new Application(nsName, attrs, options);
          stack.push(root);
        } else {
          throw new Error(g.f('Unexpected root element of {{WSDL}} or include'));
        }
      }
    };

    p.onclosetag = function(name) {
      debug('End element: %s', name);
      var top = stack[stack.length - 1];
      assert(top, 'Unmatched close tag: ' + name);

      top.endElement(stack, name);
    };

    debug('WSDL xml: %s', xml);
    p.write(xml).close();

    return root;
  };

}

module.exports = WADL;
