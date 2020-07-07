/**
 * Author: Rayes Huang @ Oracle APAC. April.2020
 */
"use strict";

module.exports = {

    metadata: () => (
        {
            "name": "dbupdate",
            "properties": {
                "sql": { "type": "string", "required": true }
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
                    conversation.transition("success");
                    done();
                }
            }
		}
        dboperation.exec(sqlConfig, console);
    }
};
