"use strict";

module.exports = {

        metadata: () => (
        {
            "name": "say_hello",
            "properties": {
                "name": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        const name = conversation.properties().name ? conversation.properties().name : '';
        conversation.reply({ text: 'Hello ' + name });
        conversation.transition();
        done();
    }
};
