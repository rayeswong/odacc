"use strict";

var Promise = require('bluebird');
var logger = require('../util/Logger');
const request = require('request');

const allUsers = require('./data/users');

module.exports = {

    metadata: function metadata() {
        return {
            "name": "praviciGetUserProfile",
            "properties": {
                "username": { "type": "string", "required": true },
                "result": { "type": "string", "required": true }
            },
            "supportedActions": [
                "success",
                "failure"
            ]
        };
    },

    invoke: (conversation, done) => {
          var _username = conversation.properties().username;
          var _result = conversation.properties().result;

          var keyword = _username.toLowerCase();

          logger.info('praviciGetAccountBalance: username = ' + _username);
          logger.info('praviciGetAccountBalance: result = ' + _result);

          var match = 0;
          var userProfile = null;
          allUsers.forEach(function(user) {
              if(match == 0){
                var keys = Object.keys(user);
                for(var i=0;i<keys.length;i++){
                    if(user[keys[i]].toLowerCase().indexOf(keyword) > -1){
                        userProfile = user;
                        match = 1;
                        break;
                    }
                }
              }
          })

          logger.info('praviciGetAccountBalance: profile = ' + JSON.stringify(userProfile));

          if(match == 1 && userProfile != null){
            conversation.variable(_result, userProfile);
            conversation.transition("success");
            done();
          }
          else{
            conversation.variable(_result, null);
            conversation.transition("failure");
            done();
          }
  
    }
};
