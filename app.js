var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');
var axios = require('axios');
var fs = require('fs');

axios({
  method: 'GET',
  url: 'https://mapitfast.agterra.com/api/Points/?projectId=2572',
  headers: {'Authorization': 'Basic ZWhvdmVyc3RlbjpEeWw0biZHdTU='}
})
  .then(res => {
    console.log(`statusCode: ${res.status}`)
    fs.writeFile('./public/data/truck-data.json', JSON.stringify(res.data), function(err) {
      if (err) return console.log(err);
      console.log('Truck data gathered');
    });
  })
  .catch(error => {
    console.error(error)
  });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(less(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index', { title: 'Food Truck Tracker'});
});
app.post('/finder-email', function(req, res) {
  console.log('Hello world!');
  fs.writeFile('/email-data.html', JSON.stringify(res.content), function(err) {
    if (err) return console.log(err);
    console.log('Email data received');
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'),() => {
  console.log(`Server running on port ${app.get('port')}!`);
});

module.exports = app;
