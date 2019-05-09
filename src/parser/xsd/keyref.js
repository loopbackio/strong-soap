// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var KeyBase = require('./keybase');
var QName = require('../qname');

class KeyRef extends KeyBase {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
  }

  postProcess(definitions) {
    super.postProcess(definitions);
    if (this.$refer) {
      let qname = QName.parse(this.$refer);
      if (qname.prefix === '') {
        qname.nsURI = this.getTargetNamespace();
      } else {
        qname.nsURI = this.getNamespaceURI(qname.prefix);
      }
    }
  }
}

KeyRef.elementName = 'keyref';

module.exports = KeyRef;
