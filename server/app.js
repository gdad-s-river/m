const path = require('path');
const favicon = require('serve-favicon');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const expressValidator = require('express-validator');
const cors = require('cors');
const responseTime = require('response-time');

const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');
const { logRequestStart } = require('./handlers/logger');

// create our Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(helmet()); // secure common headers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());
// app.use(favicon(path.join(app.get('public'), 'favicon.ico')));

app.use(
  responseTime((req, res, time) => {
    console.log(`Response Time: ${time}`);
  })
);

app.use(logRequestStart);

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);
// production error handler
// app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
