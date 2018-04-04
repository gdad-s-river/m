const mongoose = require('mongoose');

// Make sure we are running node 7.6+
const version = process.versions.node.split('.').map(parseFloat)[0];
if (version < 8) {
  console.log(
    'hey bud, heads up you are using a non-lts / current version of node'
  );
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => {
  console.error(`🚫 → ${err.message}`);
});

// import models
require('./models/UnpublishedComment');

const app = require('./app');

app.set('port', process.env.PORT || 7777);

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
