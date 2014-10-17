var Settings = require('./settings');
var settings = new Settings();
 
var request = require('./request');
request.get();
 
var redis = require("redis");
var mus = require('mustache');
 
var express = require('express');
var app = express();
app.use("/public", express.static(__dirname + '/public'));
 
app.get('/get', function(req, res){ 
 var query = {
  'city': req.query.city || 'Moscow', 
  'days': req.query.days || 7, 
  'align': (!req.query.align) ? 'v' : req.query.align // по умолчанию - вертикальная
 };
 
 var client = redis.createClient();
 client.on('error', function (err) {
  console.log('Error ' + err);
 });
 client.select(settings.dbIndex, function() {
  client.get('forecast:' + query.city, function(err, reply) {
   if (err) {
    console.log('Error ' + err);
   } else {
    var forecast = JSON.parse(reply);      
    var view = {'align': query.align, 'city': query.city, 'days':[]};
    var toMm = 0.75006375541921; // гектопаскали в мм
    for (var i=0; i<query.days; i++) {
     var obj = {
      'dt': new Date(forecast.list[i].dt * 1000).toLocaleDateString(),
      'description': forecast.list[i].weather[0].description, 
      'morn': Math.round(forecast.list[i].temp.morn), 
      'day': Math.round(forecast.list[i].temp.day), 
      'eve': Math.round(forecast.list[i].temp.eve), 
      'night': Math.round(forecast.list[i].temp.night), 
      'pressure': Math.round(forecast.list[i].pressure * toMm),
      'humidity': Math.round(forecast.list[i].humidity), 
      'clouds': Math.round(forecast.list[i].clouds), 
      'speed': Math.round(forecast.list[i].speed), 
     };
     view.days.push(obj);
    }   
    client.get(settings.dbTemplateKey, function(err, template) {
     if (err) {
      console.log('Error ' + err);
     } else {
      var output = mus.render(template, view);
      res.send(output);
     }
    });    
   }
   client.quit();
  });
 });
});
 
app.get('/', function(req, res){ 
 var client = redis.createClient();
 client.on('error', function (err) {
  console.log('Error ' + err);
 });
 client.select(settings.dbIndex, function() {
  client.get(settings.dbCitiesKey, function(err, reply) {
   if (err) {
    console.log('Error ' + err);
   } else {
    var cities = JSON.parse(reply);
    var view = {'cities':[]};
    for (var i=0; i<cities.length; i++) {
     view.cities.push({'city': cities[i]});
    }
    client.get(settings.dbFormKey, function(err, template) {
     if (err) {
      console.log('Error ' + err);
     } else {
      var output = mus.render(template, view);
      res.send(output);
     }
    });    
   }
   client.quit();
  });  
 });
});
 
app.listen(settings.port);
console.log('Listening on port ' + settings.port);
 
(function schedule() {
 setTimeout(function update() {  
  var client = redis.createClient();
  client.on('error', function (err) {
   console.log('Error ' + err);
  });
  client.select(settings.dbIndex, function() {
   client.get(settings.dbDateKey, function(err, reply) {
    if (err) {
     console.log('Error ' + err);
    } else {
     if (new Date().toLocaleDateString() != new Date(reply).toLocaleDateString()) {
      request.get();
     }
    }
   });
   client.quit();
  });
  schedule();  
 }, settings.interval);
}());