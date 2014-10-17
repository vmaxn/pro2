module.exports = function (){
 this.citiesPath = 'cities.txt',
 this.dbCitiesKey = 'cities',
 this.templatePath = 'template.html',
 this.dbTemplateKey = 'template',
 this.formPath = 'form.html',
 this.dbFormKey = 'form',
 this.dbDateKey = 'dt',
 this.dbIndex = 15,
 this.uriTemplate = 'http://api.openweathermap.org/data/2.5/forecast/daily?q={{city}}&units=metric&cnt=7&lang=ru',
 this.interval = 1000 * 60 * 30, // 30 минут
 this.port = 3000
}