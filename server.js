'use strict';

const express = require('express');
const morgan = require('morgan');

// Load array of notes
const notesRouter = require('./router/notes.router.js');

const app = express();


// Load other javascript files in this repo
const { PORT } = require('./config');

/* Not using this custom log middleware because we imported Morgan
    const { logRequestInfo } = require('./middleware/logger');
    app.use(logRequestInfo); 
*/

app.use(morgan('dev'));

//static server
app.use(express.static('public'));

app.use(express.json());

app.use('/api', notesRouter);



app.use(function(req, res, next){
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});



/* 
wrap in 'if' statement so that server only starts if server is actually 
started for real.   (require.main === module) is only true during actual server start.
It is false when doing tests, so this prevents server from automatically starting
whenever we run tests.
*/
if (require.main === module) {
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}

module.exports = app;   //export for testing

console.log('Hello Noteful!');