/**
 * Author: Rayes Huang @ Oracle APAC. July.2019
 */
"use strict";

module.exports = function()
{
    const dboperation = require('./dboperation');

    return {

        queryDatabase: function(data, callback) {
            dboperation.queryDatabase(data.sql, function(data){
                callback(data);
            });
        },	
		
        updateDatabase: function(data, callback) {
            dboperation.updateDatabase(data.sql, function(data){
                callback(data);
            });
        }		
    }
}