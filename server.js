'use strict';

const express = require('express');
const morgan = require('morgan');

// Load array of notes
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

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

const notesRouter = require('./router/notes.router.js');
app.use('/api', notesRouter);



app.use(function(req, res, next){
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({message:'Not Found'});
});


app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});



app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});

console.log('Hello Noteful!');