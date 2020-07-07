'use strict';

module.exports = {
  components: {
    'say_hello': require('./examples/say_hello'),
    'genChart': require('./chart/generate'),
    'searchEmployee': require('./hr/employee/search'),
    'listMyTeam': require('./hr/employee/listMyTeam'),
    'createUser': require('./rewards/createUser'),
    'listTxn': require('./rewards/listTxn'),
    'transferPoint': require('./rewards/transferPoint'),
    'invokeChaincode': require('./rewards/invokeChaincode'),
    'praviciGetAccountBalance': require('./pravici/getAccountBalance'),
    'praviciGetAccountHistory': require('./pravici/getAccountHistory'),
    'praviciTransferPoints': require('./pravici/transferPoints'),
    'praviciGetUserProfile': require('./pravici/getUserProfile'),
    'dbquery': require('./adwcomponents/dbquery'),
    'dbupdate': require('./adwcomponents/dbupdate'),
    "updateDealByName": require('./apexsalesdemo/updateDealByName'),
    "closeDealByName": require('./apexsalesdemo/closeDealByName'),
    "getDealsByCustomer": require('./apexsalesdemo/getDealsByCustomer'),
    "Custom.QnAFeedback": require('./feedback/feedback'),
    "Search.Google": require('./search/Search.Google')
  }
};