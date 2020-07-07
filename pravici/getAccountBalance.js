"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "praviciGetAccountBalance",
            "properties": {
                "baseURL": { "type": "string", "required": true },
                "apiKey": { "type": "string", "required": true },
                "accountId": { "type": "string", "required": true },
                "result": { "type": "string", "required": true }
            },
            "supportedActions": [
                "success",
                "failure"
            ]
        };
    },

    invoke: (conversation, done) => {
          var _baseURL = conversation.properties().baseURL;
          var _apiKey = conversation.properties().apiKey;
          var _accountId = conversation.properties().accountId;
          var _result = conversation.properties().result;

          logger.info('praviciGetAccountBalance: baseURL = ' + _baseURL);
          logger.info('praviciGetAccountBalance: apiKey = ' + _apiKey);
          logger.info('praviciGetAccountBalance: accountId = ' + _accountId);
          logger.info('praviciGetAccountBalance: result = ' + _result);

          var options = {
            url: _baseURL + '/accounts/get-balance?accountId=' + _accountId,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8',
              'Authorization': _apiKey
            },
            insecure: true,
            strictSSL: false
          };

          try {
            request(options, function(err, response, body) {
              logger.info('praviciGetAccountBalance: body=' + body);
              if(err == null){
                conversation.variable(_result, body);
                conversation.transition("success");
                done();
              }
              else{
                conversation.variable(_result, body);
                conversation.transition("failure");
                done();
              }
            });
          }
          catch (e) {
            logger.error('praviciGetAccountBalance: error=' + e);
            conversation.variable(_result, e);
            conversation.transition("failure");
            done();
          }
    }
};
