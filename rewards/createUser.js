"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
var bcService = require('../util/bcService');
const config = require('./data/config');
const allData = require('./data/data');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "createUser",
            "properties": {
                "baseUrl": { "type": "string", "required": false },
                "authToken": { "type": "string", "required": false },
                "channel": { "type": "string", "required": false },
                "chaincode": { "type": "string", "required": false },
                "chaincodeVer": { "type": "string", "required": false },
                "userId": { "type": "string", "required": true }
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

          _baseUrl = _baseUrl || config.baseUrl;
          _authToken = _authToken || config.authToken;
          _channel = _channel || config.channel;
          _chaincode = _chaincode || config.chaincode;
          _chaincodeVer = _chaincodeVer || config.chaincodeVer;

          logger.info('createUser: baseUrl = ' + _baseUrl);
          logger.info('createUser: authToken = ' + _authToken);
          logger.info('createUser: channel = ' + _channel);
          logger.info('createUser: chaincode = ' + _chaincode);
          logger.info('createUser: chaincodeVer = ' + _chaincodeVer);
          logger.info('createUser: userId = ' + _userId);

          //bcService.invokeChaincode("ch001", "dxPoints", "createUser", "v6", [ _userId ]).then(data => {
          bcService.invokeChaincode(_baseUrl, _authToken, _channel, _chaincode, "createUser", _chaincodeVer, [ _userId ]).then(data => {
            logger.info('createUser: data = ' + JSON.stringify(data));

            var returnCode = data.returnCode;

            conversation.keepTurn(true);
            if (returnCode.toLowerCase() === "success") {
              conversation.transition("success");
            } else {
              conversation.transition("failure");
            }
            done();
          });
    }
};
