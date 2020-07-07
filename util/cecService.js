"use strict"

const cecBaseUrl = "https://acec1-gse00014268.cec.ocp.oraclecloud.com";
const accessToken = "7726e40b0d34d96883b36866d9f99842";
const authorization = "Basic Y2xvdWQuYWRtaW46Y0VsaWFjQDlMYXNI";

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
      "access-token": accessToken
    },
    headers: {
      "Authorization": authorization
    },
    transform: transform
  };
  _.merge(options, args);
  logger.info("cecService.get: options = " + JSON.stringify(options));
  return rp(options);
}

module.exports.contentItems = function(qs) {
  return get(cecBaseUrl + "/content/published/api/v1/items", {
    qs: qs
  }).then(response => {
    logger.info("cecService.contentItems: response = " + JSON.stringify(response));
    if (!response.data || !response.data.items) {
      return [];
    }
    return response.data.items;
  });
};

module.exports.contentData = function(id) {
  return get(cecBaseUrl + "/content/published/api/v1/items/" + id, {
    qs: {}
  }).then(response => {
    logger.info("cecService.contentData: response = " + JSON.stringify(response));
    if (!response.data || !response.data.data) {
      return [];
    }
    return response.data.data;
  });
};

module.exports.digitalAssetUrl = function(id) {
  return cecBaseUrl + "/content/published/api/v1/digital-assets/" + id + "/default";
};
