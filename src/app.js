'use strict';

// load modules
var   express    = require('express');
var   morgan     = require('morgan');
var   mongoose   = require('mongoose');
var   seeder     = require('mongoose-seeder');
var   data       = require('./data/data.json');
var   routes     = require('./routes/index.js');
var   jsonParser = require('body-parser').json;
var   session    = require('express-session');
var   MongoStore = require('connect-mongo')(session);



var app = express();

mongoose.connect("mongodb://localhost:27017/courses");
var db = mongoose.connection;

db.on('open', () => {
  console.log("Successfully connected to MongoDB database 'courses'");
});

db.on('error', err => {
  var err = new Error('\nFATAL ERROR: There was a problem connecting the app to the associated MongoDB database. Please make sure that MongoDB is running and is accessible by this app before you retry.\n');
  err.status = 500;
  console.log(err.message);
  process.exit(1);
});

app.use(session({
  secret: 'My secret secret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));
//Body parser middleware
app.use(jsonParser());

app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if(req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE");
    return res.status(200).json({});
  }
  next();
})


// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

app.use('/api', routes);

// catch 404 and forward to global error handler
app.use((req, res, next) => {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Express's global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json(err);
});

// start listening on our port
var server = app.listen(app.get('port'), () => {
  console.log('Express server is listening on port ' + server.address().port);
});

module.exports = server;
