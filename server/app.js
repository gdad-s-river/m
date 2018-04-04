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

app.use(expressValidator());
// app.use(favicon(path.join(app.get('public'), 'favicon.ico')));

app.use(
  responseTime((req, res, time) => {
    console.log(`Response Time: ${time}`);
  })
);

app.use(logRequestStart);

app.use('/', routes);

app.use(errorHandlers.notFound);

if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

app.use(errorHandlers.productionErrors);

module.exports = app;
