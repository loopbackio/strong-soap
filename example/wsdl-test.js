var path = require('path');
var soap = require('../index');

soap.createClient(path.join(__dirname, '../test/wsdl/binding-exception.wsdl'), {},
  function(err, client) {
    if (err) {
      console.error(err);
      return;
    }
  });
