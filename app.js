var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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

function getItems(items) {
  var store = [];
  for (i = 0; i < items.length; i++) {
    var title = items[i].getElementsByTagName('Title')[0].childNodes[0].nodeValue;
    var description = items[i].getElementsByTagName('Description')[0].childNodes[0].nodeValue;;
    var lat = items[i].getElementsByTagName('Latitude')[0].childNodes[0].nodeValue;;
    var lon = items[i].getElementsByTagName('Longitude')[0].childNodes[0].nodeValue;;
    store.push({"title": title, "description": description, "lat": lat, "lon": lon});
  }
  return store;
}

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
