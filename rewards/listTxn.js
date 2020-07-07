"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
var bcService = require('../util/bcService');
const config = require('./data/config');
const allData = require('./data/data');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "listTxn",
            "properties": {
                "baseUrl": { "type": "string", "required": false },
                "authToken": { "type": "string", "required": false },
                "channel": { "type": "string", "required": false },
                "chaincode": { "type": "string", "required": false },
                "chaincodeVer": { "type": "string", "required": false },
                "userId": { "type": "string", "required": true },
                "result": { "type": "string", "required": true }
            },
            "supportedActions": [
                "success",
                "failure"
            ]
        };
    },

    invoke: (conversation, done) => {
          var _baseUrl = conversation.properties().baseUrl;
          var _authToken = conversation.properties().authToken;
          var _channel = conversation.properties().channel;
          var _chaincode = conversation.properties().chaincode;
          var _chaincodeVer = conversation.properties().chaincodeVer;
          var _userId = conversation.properties().userId;
          var _result = conversation.properties().result;

          _baseUrl = _baseUrl || config.baseUrl;
          _authToken = _authToken || config.authToken;
          _channel = _channel || config.channel;
          _chaincode = _chaincode || config.chaincode;
          _chaincodeVer = _chaincodeVer || config.chaincodeVer;

          logger.info('listTxn: baseUrl = ' + _baseUrl);
          logger.info('listTxn: authToken = ' + _authToken);
          logger.info('listTxn: channel = ' + _channel);
          logger.info('listTxn: chaincode = ' + _chaincode);
          logger.info('listTxn: chaincodeVer = ' + _chaincodeVer);
          logger.info('listTxn: userId = ' + _userId);
          logger.info('listTxn: result = ' + _result);

          //bcService.invokeChaincode("ch001", "dxPoints", "queryHistoryPoint", "v6", [ _userId ]).then(data => {
          bcService.invokeChaincode(_baseUrl, _authToken, _channel, _chaincode, "queryHistoryPoint", _chaincodeVer, [ _userId ]).then(data => {
            logger.info('listTxn: data = ' + JSON.stringify(data));

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
