'use strict';

/*  Using https://developers.google.com/custom-search/v1/using_rest
    
    Setup:
    * Create a (trial) account
    * Create a project: https://console.cloud.google.com (Top of the screen)
    * Add Custom Search API (Top level menu - API & Services - Library, Search for it)
    * Create API key (Top level menu - API & Services - Credentials, Create Credentials: API Key)
      - Restrict the API Key to only invoke Custom Search API (click on the API key pencil icon)
      - Copy API Key for use in skill
    * Setup custom search engine https://cse.google.com
*/

const MAX_LIMIT = 10;
const MIN_LIMIT = 1;
const DEFAULT_LIMIT=10;

const axios = require('axios');

module.exports = {
  metadata: () => ({
    name: 'Search.Google',
    properties: {
      apiKey: { required: true, type: 'string' },
      query: { required: false, type: 'string' },
      limit: { required: false, type: 'integer' },
      resultVar: { required: true, type: 'string' },
      customSearchEngineId: { required: true, type: 'string' }
    },
    supportedActions: ['empty']
  }),
  invoke: async (conversation, done) => {
    try{
      // perform conversation tasks.
      const { apiKey, query, limit, resultVar, customSearchEngineId } = conversation.properties();

      function empty(s){
        return !s || s.trim().startsWith('${');
      }

      if (empty(apiKey)||apiKey.toLowerCase().trim()=='null'){
        conversation.logger().info(module.exports.metadata().name+": Missing apiKey!"); //This could be intentional to disable search
        conversation.transition('empty');
        done();
        return;
      }
      if (empty(customSearchEngineId)){
        conversation.logger().warn(module.exports.metadata().name+": Missing customSearchEngineId!");
        conversation.error("Missing customSearchEngineId!");
        done();
        return;
      }
      if (empty(resultVar)){
        conversation.logger().warn(module.exports.metadata().name+": Missing resultVar!");
        conversation.error("Missing resultVar!");
        done();
        return;
      }

      //String being searched, defaults to last message shared by user
      var searchString = query;
      if (empty(searchString)){
        searchString = conversation.text();
      }
      //Limit search query to 1024 characters, total max for Google is 2048
      searchString = searchString.substring(0,1024);

      //Determine number of search results
      let num = DEFAULT_LIMIT;
      if (limit){
        if (limit<MIN_LIMIT){
          num=MAX_LIMIT;
        }
        else{
          num = Math.min(limit, MAX_LIMIT);
        }
      }

      var apiResult;
      try{
        conversation.logger().debug(module.exports.metadata().name+": Invoking: backend API for: "+searchString);
        let res = await axios({
          method: 'GET',
          timeout: 2000,
          url: 'https://www.googleapis.com/customsearch/v1?key='+apiKey+"&cx="+customSearchEngineId+"&q="+encodeURIComponent(searchString)+"&num="+encodeURIComponent(num)+"&prettyPrint=false&fields=items(title,snippet,link,mime)"
        });
        apiResult = res.data;
      }
      catch (e){
        conversation.logger().warn(module.exports.metadata().name+": Error during backend API invocation: "+e.message);
        conversation.error("Error during backend API invocation: "+e.message);
        done();
        return;
      }

      var result = [];
      try{
        var items = apiResult.items || [];
        result = items.map(item => ({
          "title" : item.title,
          "description" : item.snippet.replace(/[\n\t ]+/gm, ' ').replace(/ ([.,])/gm, '$1').trim(),
          "link" : item.link
        }));
      }
      catch (e){
        conversation.logger().error(module.exports.metadata().name+": Error parsing search results: "+e.stack);
        conversation.error("Error parsing search results: "+e.message);
        done();
        return;
      }

      conversation.variable(resultVar, result);

      if (result.length==0){
        conversation.transition('empty');
      }
      else{
        conversation.transition();
      }
      done();
    }
    catch (e){
      conversation.logger().error(module.exports.metadata().name+": Unhandled exception: "+e.stack);
      conversation.error("Unhandled exception: "+e.message);
      done();
    }
  }
};
