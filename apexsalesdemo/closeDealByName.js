"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "closeDealByName",
            "properties": {
                "baseURL": { "type": "string", "required": true },
                "customerName": { "type": "string", "required": true },
                "dealName": { "type": "string", "required": true },
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
          var _customerName = conversation.properties().customerName;
          var _dealName = conversation.properties().dealName;
          var _result = conversation.properties().result;

          logger.info('closeDealByName: baseURL = ' + _baseURL);
          logger.info('closeDealByName: customerName = ' + _customerName);
          logger.info('closeDealByName: dealName = ' + _dealName);
          logger.info('closeDealByName: result = ' + _result);

          var options = {
            url: _baseURL + '/ebasales/opportunities',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8'
            },
            body: {
              "CUSTOMER_NAME": _customerName,
              "DEAL_NAME": _dealName,
              "STATUS_ID": 11
            },
            json: true,
            insecure: true,
            strictSSL: false
          };

          try {
            request(options, function(err, response, body) {
              logger.info('closeDealByName: body=' + body);
              if(err == null){
                if(body.status = 200){
                  conversation.variable(_result, body);
                  conversation.transition("success");
                  done();
                }
                else{
                  conversation.variable(_result, body);
                  conversation.transition("failure");
                  done();
                }
              }
              else{
                conversation.variable(_result, body);
                conversation.transition("failure");
                done();
              }
            });
          }
          catch (e) {
            logger.error('closeDealByName: error=' + e);
            conversation.variable(_result, e);
            conversation.transition("failure");
            done();
          }
    }
};
