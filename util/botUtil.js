"use strict"

var baseUtils = require('./baseUtils');

module.exports.getBotName = function(conversation, nlpVariable) {
  var botName = "";
  var nlpResult = conversation.nlpResult(nlpVariable);
  if (nlpResult && nlpResult._nlpresult) {
    nlpResult = nlpResult._nlpresult;
  }
  if (!baseUtils.isEmpty(nlpResult)) {
    botName = nlpResult.botName;
  }
  return botName;
};

module.exports.getUsername = function(conversation) {
  var firstName = conversation.variable("profile.firstName");
  if (!firstName || (firstName.toLowerCase() === "unspecified")) {
    firstName = "";
  }

  var lastName = conversation.variable("profile.lastName");
  if (!lastName || (lastName.toLowerCase() === "unspecified")) {
    lastName = "";
  }

  return firstName + ((lastName === "") ? "" : " " + lastName);
};

module.exports.getUserId = function(conversation) {
  return conversation.request().message.channelConversation.userId;
};

module.exports.getSessionId = function(conversation) {
  return conversation.request().message.channelConversation.sessionId;
};

module.exports.getMessageId = function(conversation) {
  return conversation.request().message.id;
};

module.exports.getMessageTimestamp = function(conversation) {
  //return conversation.request().message.payload.timestamp;
  var d = new Date();
  return d.getTime();
};

module.exports.getMessageCreateTime = function(conversation) {
  return conversation.request().message.createdOn;
};

module.exports.getCurrState = function(conversation) {
  return conversation.request().state;
};

module.exports.getPrevState = function(conversation) {
  return conversation.request().previousState;
};
