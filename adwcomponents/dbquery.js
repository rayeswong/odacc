/**
 * Author: Rayes Huang @ Oracle APAC. April.2020
 */
"use strict";

module.exports = {

    metadata: () => (
        {
            "name": "dbquery",
            "properties": {
                "sql": { "type": "string", "required": true },
                "variable": { "type": "string", "required": true }
            },
            "supportedActions": [
                "success",
                "failure"
            ]
        }
    ),

    invoke: (conversation, done) => {
        const dboperation = require('./dbproxy/dboperation');
        const sql = conversation.properties().sql;
        const variable = conversation.properties().variable;
        var sqlConfig = {
            "sql": sql,
            "bindParams": [],
            "options": {autoCommit: true},
            "callback": function(err, result){
                if (err) {
                    conversation.transition("failure");
                    done();
                }
                else{
                    conversation.variable(variable, result.rows);
                    conversation.transition("success");
                    done();
                }
            }
		}
        dboperation.exec(sqlConfig, console);
    }
};
