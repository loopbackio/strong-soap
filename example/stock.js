var path = require('path');
var soap = require('../index');

soap.createClient(path.join(__dirname, 'wsdls/stockquote.wsdl'), {},
  function(err, client) {
    if (err) {
      console.error(err);
      return;
    }

    var req = {
      tickerSymbol: 'IBM'
    };

    var method = client['StockQuoteService']['StockQuotePort']['GetLastTradePrice'];
    method(req, console.log);

  });
