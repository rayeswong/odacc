"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
var bcService = require('../util/bcService');
const config = require('./data/config');
const allData = require('./data/data');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "invokeChaincode",
            "properties": {
                "bcsUrl": { "type": "string", "required": true },
                "authToken": { "type": "string", "required": true },
                "channel": { "type": "string", "required": true },
                "chaincode": { "type": "string", "required": true },
                "method": { "type": "string", "required": true },
                "chaincodeVer": { "type": "string", "required": true },
                "args": { "type": "string", "required": true },
                "result": { "type": "string", "required": true }
            },
            "supportedActions": [
                "success",
                "failure"
            ]
        };
    },

    invoke: (conversation, done) => {
          var _bcsUrl = conversation.properties().bcsUrl;
          var _authToken = conversation.properties().authToken;
          var _channel = conversation.properties().channel;
          var _chaincode = conversation.properties().chaincode;
          var _method = conversation.properties().method;
          var _chaincodeVer = conversation.properties().chaincodeVer;
          var _args = conversation.properties().args;
          var _result = conversation.properties().result;

          logger.info('invokeChaincode: bcsUrl = ' + _bcsUrl);
          logger.info('invokeChaincode: authToken = ' + _authToken);
          logger.info('invokeChaincode: channel = ' + _channel);
          logger.info('invokeChaincode: chaincode = ' + _chaincode);
          logger.info('invokeChaincode: method = ' + _method);
          logger.info('invokeChaincode: chaincodeVer = ' + _chaincodeVer);
          logger.info('invokeChaincode: args = ' + _args);
          logger.info('invokeChaincode: result = ' + _result);

          //bcService.invokeChaincode("ch001", "dxPoints", "createUser", "v6", [ _userId ]).then(data => {
          bcService.invokeChaincodeGeneric(_bcsUrl, _authToken, _channel, _chaincode, _method, _chaincodeVer, _args).then(data => {
            logger.info('invokeChaincode: data = ' + JSON.stringify(data));

            var returnCode = data.returnCode;
            var result = [];

            conversation.keepTurn(true);
            if (returnCode.toLowerCase() === "success") {
              result = JSON.parse(data.result.payload);
              conversation.variable(_result, result);
              conversation.transition("success");
            } else {
              conversation.variable(_result, result);
              conversation.transition("failure");
            }
            done();
          });
    }
};
