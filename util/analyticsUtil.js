"use strict"

var baseUtils = require('./baseUtils');
var botUtil = require('./botUtil');
var logger = require('./Logger');

module.exports.logIntent = logIntent;

module.exports.startAnalytics = startAnalytics;

module.exports.logEvent = logEvent;

module.exports.endAnalytics = endAnalytics;

function logIntent(conversation, nlpVariable) {
  logger.info("analyticsUtil.logIntent: conversation = " + JSON.stringify(conversation));
  logger.info("analyticsUtil.logIntent: nlpVariable = " + nlpVariable);

  var botName = botUtil.getBotName(conversation, nlpVariable);
  var channel = conversation.channelType();
  var timestamp = botUtil.getMessageCreateTime(conversation);
  var sessionId = botUtil.getSessionId(conversation) + ":" + botUtil.getMessageTimestamp(conversation);
  var username = botUtil.getUsername(conversation);

  var intent = "unresolved";
  var query = "";
  var entities = {};
  var nlpResult = conversation.nlpResult(nlpVariable);
  if (nlpResult && nlpResult._nlpresult) {
    nlpResult = nlpResult._nlpresult;
  }
  if (!baseUtils.isEmpty(nlpResult)) {
    intent = nlpResult.intentMatches.summary[0].intent;
    query = nlpResult.query;
    for (var entityName in nlpResult.entityMatches) {
      if (nlpResult.entityMatches.hasOwnProperty(entityName)) {
        if (nlpResult.entityMatches[entityName][0].originalString) {
          entities[entityName] = nlpResult.entityMatches[entityName][0].originalString;
        } else {
          entities[entityName] = nlpResult.entityMatches[entityName][0];
        }
      }
    }
  }

  var eventList = [];

  var event = {};
  event.name = "context";
  event.type = "system";
  event.timestamp = timestamp;
  event.properties = {};
  event.properties.userName = username;
  eventList.push(event);

  event = {};
  event.name = "sessionStart";
  event.type = "system";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  eventList.push(event);

  event = {};
  event.name = "intentMatches";
  event.type = "custom";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  event.properties = {};
  event.properties.botName = botName;
  event.properties.channel = channel;
  event.properties.username = username;
  event.properties.intent = intent;
  event.properties.query = query;
  for (var entityName in entities) {
    if (entities.hasOwnProperty(entityName)) {
      event.properties[entityName] = entities[entityName];
    }
  }
  eventList.push(event);

  event = {};
  event.name = "sessionEnd";
  event.type = "system";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  eventList.push(event);

  logger.info('analyticsUtil.logIntent: eventList = ' + JSON.stringify(eventList));

  var res = conversation.oracleMobile.analytics.postEvent(eventList, { "sessionId": sessionId });
  logger.info("analyticsUtil.logIntent: res = " + JSON.stringify(res));
}

function startAnalytics(conversation, nlpVariable, logPrevState, attributes) {
  logIntent(conversation, nlpVariable);

  var botName = botUtil.getBotName(conversation, nlpVariable);
  var channel = conversation.channelType();
  var timestamp = botUtil.getMessageCreateTime(conversation);
  var sessionId = botUtil.getSessionId(conversation) + ":" + botUtil.getMessageTimestamp(conversation);
  var username = botUtil.getUsername(conversation);

  var eventList = [];

  var event = {};
  event.name = "context";
  event.type = "system";
  event.timestamp = timestamp;
  event.properties = {};
  event.properties.userName = username;
  eventList.push(event);

  event = {};
  event.name = "sessionStart";
  event.type = "system";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  eventList.push(event);

  var _logPrevState = JSON.parse(logPrevState || false);
  if (_logPrevState) {
    eventList.push(createEvent(botUtil.getPrevState(conversation), timestamp, sessionId, botName, channel, username));
  }
  eventList.push(createEvent(botUtil.getCurrState(conversation), timestamp, sessionId, botName, channel, username, attributes));

  // save eventList
  var eventListVar = "user.events_" + new String(botUtil.getSessionId(conversation));
  conversation.variable(eventListVar, eventList);

  logger.info('analyticsUtil.startAnalytics: eventList = ' + JSON.stringify(eventList));
}

function logEvent(conversation, eventName, nlpVariable, attributes) {
  // get eventList
  var eventListVar = "user.events_" + new String(botUtil.getSessionId(conversation));
  var eventList = conversation.variable(eventListVar);
  if (!eventList || !(eventList instanceof Array)) {
    logger.info('analyticsUtil.logEvent: eventList = null');
    return;
  }

  var botName = botUtil.getBotName(conversation, nlpVariable);
  var channel = conversation.channelType();
  var timestamp = botUtil.getMessageCreateTime(conversation);
  var sessionId = botUtil.getSessionId(conversation) + ":" + botUtil.getMessageTimestamp(conversation);
  var username = botUtil.getUsername(conversation);

  eventList.push(createEvent(eventName, timestamp, sessionId, botName, channel, username, attributes));

  logger.info('analyticsUtil.logEvent: eventList = ' + JSON.stringify(eventList));

  // save eventList
  conversation.variable(eventListVar, eventList);
}

function endAnalytics(conversation, nlpVariable, logPrevState, attributes) {
  // get eventList
  var eventListVar = "user.events_" + new String(botUtil.getSessionId(conversation));
  var eventList = conversation.variable(eventListVar);
  if (!eventList || !(eventList instanceof Array)) {
    logger.info('analyticsUtil.endAnalytics: eventList = null');
    return;
  }

  var botName = botUtil.getBotName(conversation, nlpVariable);
  var channel = conversation.channelType();
  var timestamp = botUtil.getMessageCreateTime(conversation);
  var sessionId = botUtil.getSessionId(conversation) + ":" + botUtil.getMessageTimestamp(conversation);
  var username = botUtil.getUsername(conversation);

  var _logPrevState = JSON.parse(logPrevState || false);
  if (_logPrevState) {
    eventList.push(createEvent(botUtil.getPrevState(conversation), timestamp, sessionId, botName, channel, username));
  }
  eventList.push(createEvent(botUtil.getCurrState(conversation), timestamp, sessionId, botName, channel, username, attributes));

  var event = {};
  event.name = "sessionEnd";
  event.type = "system";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  eventList.push(event);

  // set session ID
  for (var i = 0; i < eventList.length; i++) {
    event = eventList[i];
    if (event.sessionID)
      event.sessionID = sessionId;
  }

  logger.info('analyticsUtil.endAnalytics: eventList = ' + JSON.stringify(eventList));

  conversation.oracleMobile.analytics.postEvent(eventList, { "sessionId": sessionId });

  // clear eventList
  conversation.variable(eventListVar, null);
}

function createEvent(eventName, timestamp, sessionId, botName, channel, username, attributes) {
  var event = {};
  event.name = eventName;
  event.type = "custom";
  event.timestamp = timestamp;
  event.sessionID = sessionId;
  event.properties = {};
  event.properties.botName = botName;
  event.properties.channel = channel;
  event.properties.username = username;
  if (attributes) {
    for (var property in attributes) {
      if (attributes.hasOwnProperty(property)) {
        event.properties[property] = attributes[property];
      }
    }
  }

  logger.info('analyticsUtil.createEvent: event = ' + JSON.stringify(event));

  return event;
}
