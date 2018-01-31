module.exports =
  '<soap:Body>\n  '+
    '<ns2:orderRq xmlns:ns2=\"http://example.org/ns1\">\n    '+
    '<ns2:itemRq>\n      '+
    '<ns2:ecomRq>\n        '+
      '<ns3:rqUID xmlns:ns3=\"http://example.org/ns2\">001</ns3:rqUID>\n      '+
    '</ns2:ecomRq>\n      '+
    '<ns2:item>\n        '+
      '<ns3:itemId xmlns:ns3=\"http://example.org/ns2\">item01</ns3:itemId>\n        '+
      '<qty>100</qty>\n      '+
    '</ns2:item>\n      '+
      '<ns3:backupItem xmlns:ns3=\"http://example.org/ns2\">\n        '+
      '<ns3:itemId>item02</ns3:itemId>\n        '+
      '<qty>50</qty>\n      '+
      '</ns3:backupItem>\n    '+
    '</ns2:itemRq>\n  '+
    '</ns2:orderRq>\n'+
  '</soap:Body>\n';
