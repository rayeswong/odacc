"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "praviciGetAccountHistory",
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

          logger.info('praviciGetAccountHistory: baseURL = ' + _baseURL);
          logger.info('praviciGetAccountHistory: apiKey = ' + _apiKey);
          logger.info('praviciGetAccountHistory: accountId = ' + _accountId);
          logger.info('praviciGetAccountHistory: result = ' + _result);

          var options = {
            url: _baseURL + '/transactions/get-all-by-account?accountId=' + _accountId,
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
              logger.info('praviciGetAccountHistory: body=' + body);
              if(err == null){
                conversation.variable(_result, JSON.parse(body));
                conversation.transition("success");
                done();
              }
              else{
                conversation.variable(_result, JSON.parse(body));
                conversation.transition("failure");
                done();
              }
            });
          }
          catch (e) {
            logger.error('praviciGetAccountHistory: error=' + e);
            conversation.variable(_result, e);
            conversation.transition("failure");
            done();
          }
    }
};
