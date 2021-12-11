// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

type NamespaceMapping = {
  uri: string;
  prefix: string;
  declared: boolean;
};

/**
 * Scope for XML namespaces
 * @param {NamespaceScope} [parent] Parent scope
 * @returns {NamespaceScope}
 * @constructor
 */
class NamespaceScope {
  namespaces: Record<string, NamespaceMapping> = {};
  prefixCount = 0;

  constructor(public parent: NamespaceScope) { }

  /**
   * Look up the namespace URI by prefix
   * @param {String} prefix Namespace prefix
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace URI
   */
  getNamespaceURI(prefix: string, localOnly?: boolean): string {
    switch (prefix) {
      case 'xml':
        return 'http://www.w3.org/XML/1998/namespace';
      case 'xmlns':
        return 'http://www.w3.org/2000/xmlns/';
      default:
        var nsURI = this.namespaces[prefix];
        /*jshint -W116 */
        if (nsURI != null) {
          return nsURI.uri;
        } else if (!localOnly && this.parent) {
          return this.parent.getNamespaceURI(prefix);
        } else {
          return null;
        }
    }
    'use strict';
  }

  getNamespaceMapping(prefix: string | number): NamespaceMapping {
    switch (prefix) {
      case 'xml':
        return {
          uri: 'http://www.w3.org/XML/1998/namespace',
          prefix: 'xml',
          declared: true
        };
      case 'xmlns':
        return {
          uri: 'http://www.w3.org/2000/xmlns/',
          prefix: 'xmlns',
          declared: true
        };
      default:
        var mapping = this.namespaces[prefix];
        /*jshint -W116 */
        if (mapping != null) {
          return mapping;
        } else if (this.parent) {
          return this.parent.getNamespaceMapping(prefix);
        } else {
          return null;
        }
    }
  }

  /**
   * Look up the namespace prefix by URI
   * @param {String} nsURI Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace prefix
   */
  getPrefix(nsURI: string, localOnly?: boolean): string | null {
    switch (nsURI) {
      case 'http://www.w3.org/XML/1998/namespace':
        return 'xml';
      case 'http://www.w3.org/2000/xmlns/':
        return 'xmlns';
      default:
        for (var p in this.namespaces) {
          if (this.namespaces[p].uri === nsURI) {
            return p;
          }
        }
        if (!localOnly && this.parent) {
          return this.parent.getPrefix(nsURI);
        } else {
          return null;
        }
    }
  }

  /**
   * Look up the namespace prefix by URI
   * @param {String} nsURI Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace prefix
   */
  getPrefixMapping(nsURI: string, localOnly?: boolean): string | NamespaceMapping | null {
    switch (nsURI) {
      case 'http://www.w3.org/XML/1998/namespace':
        return 'xml';
      case 'http://www.w3.org/2000/xmlns/':
        return 'xmlns';
      default:
        for (var p in this.namespaces) {
          if (this.namespaces[p].uri === nsURI && this.namespaces[p].declared===true) {
            return this.namespaces[p];
          }
        }
        if (!localOnly && this.parent) {
          return this.parent.getPrefixMapping(nsURI);
        } else {
          return null;
        }
    }
  }

  /**
   * Generate a new prefix that is not mapped to any uris
   * @param base {string} The base for prefix
   * @returns {string}
   */
  generatePrefix(base: string): string {
    base = base || 'ns';
    while (true) {
      let prefix = 'ns' + (++this.prefixCount);
      if (!this.getNamespaceURI(prefix)) {
        // The prefix is not used
        return prefix;
      }
    }
  }
}

/**
 * Namespace context that manages hierarchical scopes
 * @returns {NamespaceContext}
 * @constructor
 */
class NamespaceContext {
  scopes: NamespaceScope[] = [];
  currentScope: NamespaceScope | null;

  constructor() {
    this.pushContext();
  }

  /**
   * Add a prefix/URI namespace mapping
   * @param {String} prefix Namespace prefix
   * @param {String} nsURI Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {boolean} true if the mapping is added or false if the mapping
   * already exists
   */
  addNamespace(prefix: string, nsURI: string, localOnly?: boolean): boolean {
    if (this.getNamespaceURI(prefix, localOnly) === nsURI) {
      return false;
    }
    if (this.currentScope) {
      this.currentScope.namespaces[prefix] = {
        uri: nsURI,
        prefix: prefix,
        declared: false
      };
      return true;
    }
    return false;
  }

  /**
   * Push a scope into the context
   * @returns {NamespaceScope} The current scope
   */
  pushContext() {
    var scope = new NamespaceScope(this.currentScope);
    this.scopes.push(scope);
    this.currentScope = scope;
    return scope;
  }

  /**
   * Pop a scope out of the context
   * @returns {NamespaceScope} The removed scope
   */
  popContext(): NamespaceScope {
    var scope = this.scopes.pop();
    if (scope) {
      this.currentScope = scope.parent;
    } else {
      this.currentScope = null;
    }
    return scope;
  }

  /**
   * Look up the namespace URI by prefix
   * @param {String} prefix Namespace prefix
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace URI
   */
  getNamespaceURI(prefix: string, localOnly?: boolean) {
    return this.currentScope &&
      this.currentScope.getNamespaceURI(prefix, localOnly);
  }

  /**
   * Look up the namespace prefix by URI
   * @param {String} nsURI Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace prefix
   */
  getPrefix(nsURI: string, localOnly?: boolean): string | null {
    return this.currentScope &&
      this.currentScope.getPrefix(nsURI, localOnly);
  }

  /**
   * Look up the namespace mapping by nsURI
   * @param {String} nsURI Namespace URI
   * @returns {String} Namespace mapping
   */
  getPrefixMapping(nsURI: string): string | NamespaceMapping | null {
    return this.currentScope &&
      this.currentScope.getPrefixMapping(nsURI);
  }

  /**
   * Generate a new prefix that is not mapped to any uris
   * @param base {string} The base for prefix
   * @returns {string}
   */
  generatePrefix(base?: string): string {
    return this.currentScope &&
      this.currentScope.generatePrefix(base);
  }

  /**
   * Register a namespace
   * @param {String} prefix Namespace prefix
   * @param {String} nsURI Namespace URI
   * @returns {Object} The matching or generated namespace mapping
   */
  registerNamespace(prefix: string | undefined, nsURI: string): NamespaceMapping {
    var mapping: NamespaceMapping;
    if (!prefix) {
      prefix = this.generatePrefix();
    } else {
      mapping = this.currentScope.getNamespaceMapping(prefix);
      if (mapping && mapping.uri === nsURI) {
        // Found an existing mapping
        return mapping;
      }
    }
    if (this.getNamespaceURI(prefix)) {
      // The prefix is already mapped to a different namespace
      prefix = this.generatePrefix();
    }
    if (this.currentScope) {
      mapping = {
        uri: nsURI,
        prefix: prefix,
        declared: false
      };
      this.currentScope.namespaces[prefix] = mapping;
      return mapping;
    }
    return null;
  }

  /**
   * Declare a namespace prefix/uri mapping
   * @param {String} prefix Namespace prefix
   * @param {String} nsURI Namespace URI
   * @returns {Boolean} true if the declaration is created
   */
  declareNamespace(prefix?: string, nsURI?: string): NamespaceMapping | null {
    var mapping = this.registerNamespace(prefix, nsURI);
    if (!mapping) return null;
    if (mapping.declared) {
      return null;
    }
    mapping = this.currentScope.namespaces[mapping.prefix];
    if (mapping) {
      mapping.declared = true;
    } else {
      mapping = {
        prefix: mapping.prefix,
        uri: nsURI,
        declared: true
      };
      this.currentScope.namespaces[mapping.prefix] = mapping;
    }
    return mapping;
  };
}

module.exports = NamespaceContext;
