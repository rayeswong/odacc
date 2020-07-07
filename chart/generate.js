"use strict";

const ChartjsNode = require('chartjs-node');
const fs = require('fs');     
const RESTClient = require('node-rest-client').Client;
const restClient = new RESTClient();
const Freemarker = require('freemarker');
const freemarker = new Freemarker();

const allReportsMetaFile = './chart/config/reports.json';
const host = 'http://129.213.46.169:81';
const path = '/report/';

module.exports = {
	
    metadata: () => (
        {
            "name": "genChart",
            "properties": {
                "reportName": { "type": "string", "required": true },
                "language": { "type": "string", "required": true },
				"reportFilter": { "type": "string", "required": false }, 
                "contextVariable": { "type": "string", "required": true },
                "eventVariable": { "type": "string", "required": true },
                "keepTurn": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
   
        const reportName = conversation.properties().reportName;
        const language = conversation.properties().language;
        const reportFilter = conversation.properties().reportFilter;
        const contextVariable = conversation.properties().contextVariable;
        const eventVariable = conversation.properties().eventVariable;
        const keepTurn = conversation.properties().keepTurn;

        var allReportsMeta = JSON.parse(fs.readFileSync(allReportsMetaFile, 'utf-8'));
        var url = allReportsMeta[reportName]['endpoint']['url'];
        var parameters = Object.assign({},allReportsMeta[reportName]['endpoint']['parameters']);
        var context = conversation.variable(contextVariable);
        if(context != null){
            console.log("***context***\n" + JSON.stringify(context));
            for (var prop in context) {
                console.log("***context-" + prop + "***\n" + parameters.hasOwnProperty(prop));
                if(parameters.hasOwnProperty(prop)){
                    parameters[prop] = context[prop];
                }
            }
        }
        else{
            context = {};
        }
        if(reportFilter != null){
            console.log("***reportFilter***\n" + reportFilter);
            var reportFilterJSON = JSON.parse(reportFilter);
            for (var prop in reportFilterJSON) {
                console.log("***reportFilter-" + prop + "***\n" + parameters.hasOwnProperty(prop));
                if(parameters.hasOwnProperty(prop)){
                    parameters[prop] = reportFilterJSON[prop];
                }
            }
        }
        
        var args = {parameters: parameters};
        console.log("***Calling url***\n" + url);
        console.log("***Calling url with query parameters***\n" + JSON.stringify(parameters));
        restClient.get(url, args, function(data, apiResponse) {
            console.log("***data***\n" + JSON.stringify(data));
            var reportConfigFile = allReportsMeta[reportName]['config']['filepath'] + '/' + language + '/' + allReportsMeta[reportName]['config']['filename'];
            let reportConfigString = fs.readFileSync(reportConfigFile, 'utf-8');
            console.log('***reportConfigString***\n' + reportConfigString);
            freemarker.render(reportConfigString, { data: data, filter: parameters, context: context }, (err, result) => {
                if (err) {
                    console.log('***err***\n' + err);
                    conversation.reply({text: "Sorry. I got error when generating the report"});
                }
                else{
                    console.log('***reportConfig***\n' + result);
                    var reportConfig = JSON.parse(result);
                    for (var i = 0; i < reportConfig['reply'].length; i++) { 
                        var reply = reportConfig['reply'][i];
                        if (reply['type'] == 'text'){
                            var data = "";
                            if (reply['data']){
                                for (var j = 0; j < reply['data']['text'].length; j++) { 
                                    data += reply['data']['text'][j];
                                }
                            }
                            conversation.reply({text: reply['prompt'] + data});
                        }
                        else if (reply['type'] == 'bar' || reply['type'] == 'line'){
                            var chartNode = new ChartjsNode(600, 600);
                            var timestamp = (new Date()).getTime();
                            var file = timestamp + '.png';
                            var imageURL = host + path + file;
                            chartNode.drawChart(reply)
                            .then(() => {
                                chartNode.writeImageToFile('image/png', '/usr/share/nginx/html/report/' + file);                   
                            });
                            var imageMessage = conversation.MessageModel().attachmentConversationMessage('image', imageURL);
                            conversation.reply(imageMessage);
                        }
                    }
                    conversation.variable(contextVariable, reportConfig['context']);
                    conversation.variable(eventVariable, reportConfig['event']);
                }                
                conversation.keepTurn(keepTurn);
                conversation.transition();
                done();
            });
        });
    }
};
