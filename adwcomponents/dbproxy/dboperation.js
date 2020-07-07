'use strict';

const oracledb = require('oracledb');
const dbconfig = require('./dbconfig');

module.exports = {
    initialized: false,
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    },
    init: async function(logger) {
        let self = this;
        logger = logger || console;
        if(self.initialized){
            logger.info("dboperation", "DB Connection pool already initialized!");
            return;
        }

        logger.info("dboperation", "Initializaing database connection pool...");
        logger.info("dboperation", "Driver version is " + oracledb.versionString);
        logger.info("dboperation", "Oracle client library version: " + oracledb.oracleClientVersion);

        oracledb.createPool(dbconfig, function(err, pool){
            if(err) {
                logger.error("dboperation", "Failed to create database pool");
                logger.error("dboperation", err);
                self.initialized = false;
            } else {
                logger.info("dboperation", "Created pool: " + pool.poolAlias);
                self.initialized = true;
            }
        });
    },
    exec: async function(sqlConfig, logger) {
        let self = this;
        logger = logger || console;
        
        while (!self.initialized) {
            await self.init(logger);
            if(!self.initialized) {
                logger.warn("Waiting for connection ready!");
                await self.sleep(1000);
            }
        }

        logger.info("dboperation", "Establishing database connection...");
        oracledb.getConnection(dbconfig.poolAlias, function(err, connection) {
            if (err) {
              logger.error(err.message);
              return;
            }
            logger.info("dboperation", "Executing database operation...");
            connection.execute(
                sqlConfig.sql,
                sqlConfig.bindParams,
                sqlConfig.options,
                function(err, result) {
                    if (err) {
                        logger.error("dboperation", 
                            "Error happened in executing sql: " + sqlConfig.sql);
                        logger.error("dboperation", err);
                    } else {
                        logger.info("dboperation", 
                            "Executing database operation...[Success]");
                    }
                    //logger.info(sqlConfig.sql, result);
                    if(sqlConfig.callback) {
                        sqlConfig.callback(err, result);
                    }
                    connection.close(function (err) {
                        if (err) logger.error("dboperation", err);
                    });
                });
            }
        )
    }
}