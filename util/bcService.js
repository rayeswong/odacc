"use strict"

const bcBaseUrl = "https://37696A06923A427D94969D88EAA65168.blockchain.ocp.oraclecloud.com:443";
const authorization = "Basic eWsud3VAb3JhY2xlLmNvbTpXZWxjb21lMTIzNDUh";

var rp = require('request-promise');
var _ = require('lodash');
var logger = require('./Logger');

const transform = function(body, response, resolveWithFullResponse) {
  return {
    data: body,
    headers: response.headers,
    statusCode: response.statusCode
  };
};

function get(url, args) {
  var options = {
    uri: url,
    json: true,
    qs: {
    },
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    transform: transform
  };
  _.merge(options, args);
  logger.info("bcService.get: options = " + JSON.stringify(options));
  return rp(options);
}

function post(url, args) {
  var options = {
    method: "POST",
    uri: url,
    json: true,
    qs: {
    },
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: {
    },
    transform: transform
  };
  _.merge(options, args);
  logger.info("bcService.post: options = " + JSON.stringify(options));
  return rp(options);
}

function put(url, args) {
  var options = {
    method: "PUT",
    uri: url,
    json: true,
    qs: {
    },
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: {
    },
    transform: transform
  };
  _.merge(options, args);
  logger.info("bcService.put: options = " + JSON.stringify(options));
  return rp(options);
}

module.exports.invokeChaincode = function(baseUrl, authToken, channel, chaincode, method, chaincodeVer, args) {
  return post(baseUrl + "/restproxy1/bcsgw/rest/v1/transaction/invocation", {
    headers: { "Authorization": authToken },
    body: { 'channel': channel, 'chaincode': chaincode, 'method': method, 'chaincodeVer': chaincodeVer, 'args': args }
  }).then(response => {
    logger.info("bcService.invokeChaincode: response = " + JSON.stringify(response));
    if (!response.data) {
      return {};
    }
    return response.data;
  });
};

module.exports.invokeChaincodeGeneric = function(bcsUrl, authToken, channel, chaincode, method, chaincodeVer, args) {
  return post(bcsUrl, {
    headers: { "Authorization": authToken },
    body: { 'channel': channel, 'chaincode': chaincode, 'method': method, 'chaincodeVer': chaincodeVer, 'args': args }
  }).then(response => {
    logger.info("bcService.invokeChaincode: response = " + JSON.stringify(response));
    if (!response.data) {
      return {};
    }
    return response.data;
  });
};
