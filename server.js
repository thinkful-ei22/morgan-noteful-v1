'use strict';

const express = require('express');

// Load array of notes
const data = require('./db/notes');

const app = express();


// ADD STATIC SERVER HERE
app.use(express.static('public'));


// INSERT EXPRESS APP CODE HERE...
app.get('/api/notes', (req, res) => {
  res.json(data);
});

app.get('/api/notes/:id', (req, res) => {
  const targetId = parseInt(req.params.id);
  const targetArticle = data.find(obj => obj.id === targetId);
  res.send(targetArticle);
});


app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});

console.log('Hello Noteful!');

