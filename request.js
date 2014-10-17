var Settings = require('./settings');
var settings = new Settings();
 
var request = require('request');
var redis = require("redis");
var mus = require('mustache');
 
 exports.get = function() {
 var client = redis.createClient();
 client.on('error', function (err) {
  console.log('Error ' + err);
 });
 
 
 client.select(settings.dbIndex, function() {
  client.get('cities', function(err, reply) {
   if (err) {
    console.log('Error ' + err);
   } else {
    var cities = JSON.parse(reply);
    for (var i=0; i<cities.length; i++) {   
     var url = {'url': mus.render(settings.uriTemplate, {'city': cities[i]})};
     request(url, function (err, response, body) {
      if (!err && response.statusCode == 200) {
       var forecast = JSON.parse(body);
       var client = redis.createClient();
       client.on('error', function (err) {
        console.log('Error ' + err);
       });
       client.select(settings.dbIndex, function() {      
        client.set('forecast:' + forecast.city.name, JSON.stringify(forecast), redis.print); // прогноз
        client.set(settings.dbDateKey, new Date().toString()); // дата обновления
        client.quit();
       });
      } else {
       console.log('Error ' + err);
      }
     });
    }
   }
  });
  client.quit();
 });
}