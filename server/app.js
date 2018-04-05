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

const app = express();

// view engine setup
// set it to jsx, when one would need ssr
// TODO: https://github.com/reactjs/express-react-views

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

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
