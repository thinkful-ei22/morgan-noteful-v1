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


app.get('/api/notes', (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err);
    }
    res.json(list);
  });
});


app.get('/api/notes/:id', (req, res, next) => {
  const targetId = req.params.id;
  notes.find(targetId, (err, item) => {
    if (err) {
      return next(err);
    }
    res.json(item);
  });
});

app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });


  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});


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