var soap = require('../index');
var WSDL = soap.WSDL;

WSDL.loadSystemSchemas(function(err, schemas) {
  if (err) {
    console.error(err);
  } else {
    console.log(Object.keys(schemas));
  }
});
