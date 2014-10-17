var Settings = require('./settings');
var settings = new Settings();
 
var fs = require('fs');
var redis = require("redis");
 
init(settings.citiesPath, settings.dbCitiesKey, settings.dbIndex);
init(settings.templatePath, settings.dbTemplateKey, settings.dbIndex);
init(settings.formPath, settings.dbFormKey, settings.dbIndex);
 
function init(path, key, dbIndex) {
 fs.exists(path, function(exists) {
  if (!exists) {
   console.log('Path ' + path + ' does not exists');
  } else {
   fs.readFile(path, function(err, content) {
    if (err) {
     console.log('Cannot read file ' + path);
    } else {
     var client = redis.createClient();
     client.on("error", function (err) {
      console.log("Error " + err);
     });
     client.select(dbIndex, function() {     
      var value = (key == 'cities') ? JSON.stringify(String(content).replace(/^\s+/, "").split(/\s*,\s*/)) : String(content).replace(/^\s+/, "");     
      client.set(key, value, redis.print);     
      client.quit();
     });
    }
   });
  }
 });
}