'use strict';

const { sequelize, models } = require('./db');

// Get references to our models.
const { User, Course } = models;

console.log('Testing the connection to the database...');

(async () => {
  try {
    // Test the connection to the database
    console.log('Connection to the database successful!');
    await sequelize.authenticate();

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync();

    // Retrieve users
    // const users = await User.findAll({
    //     include: [
    //       {
    //         model: Course,
    //         as: 'course'
    //       },
    //     ],
    //   });
    // console.log(users.map(user => user.get({ plain: true })));
    
    //process.exit();

  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();


// load modules
const express = require('express');
const morgan = require('morgan');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

const routes = require('./routes/index');

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
