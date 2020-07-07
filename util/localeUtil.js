
var localeCode = require("locale-code");
var logger = require('./Logger');

module.exports.menuLabel = {
    "default" : "目錄",
    "en" : "Menu"
  };

  module.exports.noAnswerLabel = {
    "default" : "抱歉, 我找不到答案。",
    "en" : "Sorry, I cannot find the answer."
  };

  module.exports.unsupportedTypeLabel = {
    "default" : "抱歉, 我暫時不支持這個答案的類型： ",
    "en" : "Sorry this response type is not yet supported: "
  }

  module.exports.noDescMsg = {
    "default" : "暫時未有描述提供",
    "en" : "No Description Available"
  };
/**
 * lookup a Object based on locale string.
 *
 * @param {String} locale
 * @param {Object} obj
 * @return {object}
 *
 */

 module.exports.lookupByLocale = function (obj, locale){
   //if obj is not truthy, return
   if (!obj) return obj;

   //check null/undefined for locale
   locale = locale||"";

   //if obj is not a json obj, say an array, or string return original
   if (obj && (!(obj instanceof Object) || obj instanceof Array)) {
     logger.debug('getAnswer', 'lookupByLocale obj not an Object and will return orginal obj: ' + obj);
     return obj;
   }
   var result;
   //if locale is empty, then only choice is to use default
   if (!locale && obj['default']) {

       //not the most efficient way to bubble up a obj without the default
       //to return the orignial obj but this is more managable
       result = obj['default'];
   }
   //if locale is NOT empty, then, try an exact mactch first
   else if (obj[locale]) {
       result = obj[locale];
   }
   //if No exact match, try to look up with just the language code
   else if (obj[localeCode.getLanguageCode(locale)]) {
       result = obj[localeCode.getLanguageCode(locale)];
   }
   //if No match, then, look for a default
   else if (obj["default"]) {
       result = obj['default'];
   }
   //if none of this are matched, return original
   else {
     result = obj;
   }
   return result;
 };

 module.exports.getCanonicalLocale = function (locale) {
   if (!locale) return "zh-HK";
   if ((locale.indexOf("_") < 0) && (locale.indexOf("-") < 0)) return "zh-HK";
   return locale.replace("_", "-");
 };
