"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "praviciTransferPoints",
            "properties": {
                "baseURL": { "type": "string", "required": true },
                "apiKey": { "type": "string", "required": true },
                "fromAccountId": { "type": "string", "required": true },
                "toAccountId": { "type": "string", "required": true },
                "point": { "type": "string", "required": true },
                "description": { "type": "string", "required": true },
                "attributes": { "type": "string", "required": true },
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
          var _fromAccountId = conversation.properties().fromAccountId;
          var _toAccountId = conversation.properties().toAccountId;
          var _point = conversation.properties().point;
          var _description = conversation.properties().description;
          var _attributes = conversation.properties().attributes;
          var _result = conversation.properties().result;

          logger.info('praviciTransferPoints: baseURL = ' + _baseURL);
          logger.info('praviciTransferPoints: apiKey = ' + _apiKey);
          logger.info('praviciTransferPoints: fromAccountId = ' + _fromAccountId);
          logger.info('praviciTransferPoints: toAccountId = ' + _toAccountId);
          logger.info('praviciTransferPoints: point = ' + _point);
          logger.info('praviciTransferPoints: description = ' + _description);
          logger.info('praviciTransferPoints: attributes = ' + _attributes);
          logger.info('praviciTransferPoints: result = ' + _result);

          var options = {
            url: _baseURL + '/transactions/create',
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8',
              'Authorization': _apiKey
            },
            body: {
              "From": _fromAccountId,
              "To": _toAccountId,
              "Points": _point,
              "Description": _description,
              "Attributes": _attributes
            },
            json: true,
            insecure: true,
            strictSSL: false
          };

          try {
            request(options, function(err, response, body) {
              logger.info('praviciTransferPoints: body=' + body);
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
            logger.error('praviciTransferPoints: error=' + e);
            conversation.variable(_result, e);
            conversation.transition("failure");
            done();
          }
    }
};
