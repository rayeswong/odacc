"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "getDealsByCustomer",
            "properties": {
                "baseURL": { "type": "string", "required": true },
                "customerName": { "type": "string", "required": true },
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
          var _result = conversation.properties().result;

          logger.info('getDealsByCustomer: baseURL = ' + _baseURL);
          logger.info('getDealsByCustomer: customerName = ' + _customerName);
          logger.info('getDealsByCustomer: result = ' + _result);

          var options = {
            url: _baseURL + '/ebasales/opportunities?customer_name=' + _customerName,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8'
            },
            insecure: true,
            strictSSL: false
          };

          try {
            request(options, function(err, response, body) {
              logger.info('getDealsByCustomer: body=' + body);
              if(err == null){
                if(JSON.parse(body).count > 0){
                  conversation.variable(_result, JSON.parse(body).items);
                }
                else{
                  conversation.variable(_result, null);
                }
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
            logger.error('getDealsByCustomer: error=' + e);
            conversation.variable(_result, e);
            conversation.transition("failure");
            done();
          }
    }
};
