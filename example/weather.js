var path = require('path');
var soap = require('../index');

soap.createClient(path.join(__dirname, 'wsdls/weather.wsdl'), {},
  function(err, client) {
    if (err) {
      console.error(err);
      return;
    }

    var req = {
      ZIP: '94555'
    };

    var method = client['Weather']['WeatherSoap']['GetCityWeatherByZIP'];
    method(req, console.log);

  });
