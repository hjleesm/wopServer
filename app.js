// app.js

// [LOAD PACKAGES]
var express         = require('express');
var app             = express();

var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var cors 		    = require('cors');
var passport        = require('passport');
var passportConfig  = require('./passport');

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

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passportConfig();

// DEFINE MODEL
var Bible = require('./models/bible');
var Account = require('./models/account');

var _passport = require('./module/passport')(Account);

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 8080;

// [CONFIGURE ROUTER]
var router = require('./routes')(app, Bible, Account);

// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port);
});


