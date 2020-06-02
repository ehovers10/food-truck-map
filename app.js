var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');
var axios = require('axios');
var fs = require('fs');

var ParseData = require('./parser.js');

var mifUser = process.env.MIF_USER;
var mifPass = process.env.MIF_PASS;
var mifAuth = Buffer.from(mifUser + ':' + mifPass).toString('base64');

var config = {
  project: {
    id: process.env.MIF_PROJECT,
    element: process.env.MIF_ELEMENT
  },
  primaryMap: {
    token: process.env.PRIMARY_TOKEN,
    style: process.env.PRIMARY_STYLE
  },
  secondaryMap: {
    token: process.env.SECONDARY_TOKEN,
    style: process.env.SECONDARY_STYLE
  }
}

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
  res.render('index', { title: 'Food Truck Finder'});
});
app.post('/data', function(req,res) {
  axios({
      method: 'GET',
      url: `https://mapitfast.agterra.com/api/${config.project.element}/?projectId=${config.project.id}`,
      headers: {'Authorization': `Basic ${mifAuth}`}
    })
    .then(response => {
      var parsed = ParseData(response.data);
      res.json({'data': parsed, 'config': config});
    })
    .catch(error => {
      console.log('Not good');
      console.error(error);
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
