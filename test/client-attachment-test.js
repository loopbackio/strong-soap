'use strict';

var fs = require('fs'),
    http = require('..').http,
    //http = require('http'),
    //WSDL = soap.WSDL,
    assert = require('assert'),
    QName = require('..').QName;

describe('SOAP Http attachment', function() {
    it('attachment null', function(done){
        var httpClient = new http({})
        const option = httpClient.buildRequest('http://localhost:1', {}, {}, {});
        assert.ok(!option.multipart)
        assert.ok(option.body)
        done()
    })

    it('attachment length 1', function(done){
        var httpClient = new http({})
        const optionEx = {
            attachments:[{ 
                name: 'teste',
                contentId: '123445555',
                mimetype: 'jpeg',
                body: 'stream file'
            }]
        }
        const option = httpClient.buildRequest('http://localhost:1', {}, {}, optionEx);
        assert.ok(option.multipart.length > 0)
        assert.ok(!option.body)
        done()
    })
})