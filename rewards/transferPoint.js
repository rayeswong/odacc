"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
var bcService = require('../util/bcService');
const config = require('./data/config');
const allData = require('./data/data');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "transferPoint",
            "properties": {
                "baseUrl": { "type": "string", "required": false },
                "authToken": { "type": "string", "required": false },
                "channel": { "type": "string", "required": false },
                "chaincode": { "type": "string", "required": false },
                "chaincodeVer": { "type": "string", "required": false },
                "userId": { "type": "string", "required": true },
                "rewardName": { "type": "string", "required": true },
                "conversion": { "type": "string", "required": true },
                "dxPoints": { "type": "string", "required": true },
                "vendorPoints": { "type": "string", "required": true },
                "vendor": { "type": "string", "required": true }
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
          var _rewardName = conversation.properties().rewardName;
          var _conversion = conversation.properties().conversion;
          var _dxPoints = conversation.properties().dxPoints;
          var _vendorPoints = conversation.properties().vendorPoints;
          var _vendor = conversation.properties().vendor;

          _baseUrl = _baseUrl || config.baseUrl;
          _authToken = _authToken || config.authToken;
          _channel = _channel || config.channel;
          _chaincode = _chaincode || config.chaincode;
          _chaincodeVer = _chaincodeVer || config.chaincodeVer;

          logger.info('transferPoint: baseUrl = ' + _baseUrl);
          logger.info('transferPoint: authToken = ' + _authToken);
          logger.info('transferPoint: channel = ' + _channel);
          logger.info('transferPoint: chaincode = ' + _chaincode);
          logger.info('transferPoint: chaincodeVer = ' + _chaincodeVer);
          logger.info('transferPoint: userId = ' + _userId);
          logger.info('transferPoint: rewardName = ' + _rewardName);
          logger.info('transferPoint: conversion = ' + _conversion);
          logger.info('transferPoint: dxPoints = ' + _dxPoints);
          logger.info('transferPoint: vendorPoints = ' + _vendorPoints);
          logger.info('transferPoint: vendor = ' + _vendor);

          //bcService.invokeChaincode("ch001", "dxPoints", "transferPoint", "v6", [ _userId, _rewardName, _conversion, _dxPoints, _vendorPoints, _vendor ]).then(data => {
          bcService.invokeChaincode(_baseUrl, _authToken, _channel, _chaincode, "transferPoint", _chaincodeVer, [ _userId, _rewardName, _conversion, _dxPoints, _vendorPoints, _vendor ]).then(data => {
            logger.info('transferPoint: data = ' + JSON.stringify(data));

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
