// app.js

// [LOAD PACKAGES]
var express         = require('express');
var app             = express();

var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var cors 		    = require('cors');
var passport        = require('passport');
var session			= require('express-session');
var cookieSession 	= require('cookie-session');
var flash 			= require('connect-flash');
var path 			= require('path');

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

// [ CONFIGURE mongoose ]
// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/wop');

// DEFINE MODEL
var Bible = require('./models/bible');
var Account = require('./models/account');
var Tag = require('./models/tags');

// Session
app.use(cookieSession({
  keys: ['wop'],
  cookie: {
    maxAge: 1000 * 60 * 60 // 유효기간 1시간
  }
}));
app.use(flash());

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 8080;

// [CONFIGURE ROUTER]
app.use(express.static(path.join(__dirname, 'wop')));

var router = require('./routes')(app, Bible, Account, Tag, passport);

// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port);
});


