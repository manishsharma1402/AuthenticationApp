var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');
var expressValidator = require('express-validator')

var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use( multer({dest: './uploads'}).single('profileimage'));



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(session({
	secret: 'sonic',
	saveUninitialized: true,
	resave: true
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		
		return{
			param: formParam,
			msg: msg,
			value: value
		}
	}
}));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req,res);
	next();
});

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});
app.use('/', routes);
app.use('/users', users);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
