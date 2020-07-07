/**
 * Author: Rayes Huang @ Oracle APAC. Nov.2018
 */
"use strict";

const oracledb = require('oracledb');   // In Prod
//const oracledb = require('oracledb-pb');  // In Dev
const dbconfig = require('./dbconfig.js');

module.exports = {

	getOracleDb: function(){
		return oracledb;
	},
	
	doDbOperation: function(sqlConfig, readonly) {
	  let __this = this;
	  oracledb.getConnection(
	    {
	      user          : dbconfig.user,
	      password      : dbconfig.password,
	      connectString : dbconfig.connectString
	    }, function(err, connection) {
		    if (err) {
		      console.error(err.message);
		      return;
		    }
		    connection.execute(
		      sqlConfig.sql,
		      sqlConfig.bindParams,
		      sqlConfig.options,
		      function(err, result)
		      {
		        if (err) {
                  console.log("Error happened in executing sql: " + sqlConfig.sql);
                  console.error(err.message);
                } else {
                    if(sqlConfig.callback) {
						console.log("SQL executed successfully: ", sqlConfig.sql);
						if(readonly){
							console.log("Rows returned: ", result.rows);	
							sqlConfig.callback(result.rows || []);
						}
						else{
							console.log("Result returned: ", JSON.stringify(result));
							sqlConfig.callback(result);
							connection.commit();
						}
                    }
                }
                __this.doRelease(connection); 
		      });
		  }
		);
	},

	doRelease: function(conn) {
	  conn.close(function (err) {
	    if (err)
	      console.error(err.message);
	  });
	},
	
	updateDatabase: function updateDatabase(sql, callback) {
		var sqlConfig = {
			"sql": sql,
			"bindParams": [],
			"options": {outFormat: oracledb.OBJECT},
			"callback": function(result) {
				callback(result);
			}
		}
		this.doDbOperation(sqlConfig, false);
	},	
	
	queryDatabase: function getMaterialTypesByTopic(sql, callback) {
		var sqlConfig = {
			"sql": sql,
			"bindParams": [],
			"options": {outFormat: oracledb.OBJECT},
			"callback": function(rows) {
				callback([...rows]);
			}
		}
		this.doDbOperation(sqlConfig, true);
	}

};