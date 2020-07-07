"use strict";

const allEmployees = require('./data/employees');

module.exports = {
	
    metadata: () => (
        {
            "name": "listMyTeam",
            "properties": {
                "variable": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        const variable = conversation.properties().variable;
        conversation.variable(variable, allEmployees);
        conversation.transition();
        done();
    }
};