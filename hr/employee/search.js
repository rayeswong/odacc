"use strict";

module.exports = {
	
    metadata: () => (
        {
            "name": "searchEmployee",
            "properties": {
                "title": { "type": "string", "required": false },
                "department": { "type": "string", "required": false },
                "attributes": { "type": "string", "required": false },
                "variable": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        const title = conversation.properties().title;
        const department = conversation.properties().department;
        const attributes = conversation.properties().attributes;
        const variable = conversation.properties().variable;
        if(title == 'Store Manager' && department == 'Central'){
            conversation.variable(variable, {
                name: 'Peter Parker',
                phone: '91239123',
                email: 'peter.parker@supremo.com'
            });
        } else if(title == 'Store Manager' && department == 'Admiralty'){
            conversation.variable(variable, {
                name: 'Harry Osborn',
                phone: '91238503',
                email: 'harry.osborn@supremo.com'
            });
        } else {
            conversation.variable(variable, null);
        }
        conversation.transition();
        done();
    }
};
