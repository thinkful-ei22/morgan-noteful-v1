'use strict';

const express = require('express');

const data = require('../db/notes');
const simDB = require('../db/simDB');

const notesRouter = express.Router();
const notes = simDB.initialize(data);


notesRouter.get('/notes', (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  notes.filter(searchTerm)
    .then( list => {
      if(list) {
        return res.json(list);
      }
    })
    .catch( err => next(err));
});





notesRouter.get('/notes/:id', (req, res, next) => {
  const targetId = req.params.id;
  notes.find(targetId)
    .then(item => {
      if(item) {
        return res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});




notesRouter.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body.');
    err.status = 400;
    return next(err);
  }

  notes.update(id, updateObj)
    .then( item => {
      if(item) {
        res.json(item);
      } else {
        next();
      }
    }).catch(err => next(err));
});




notesRouter.post('/notes', (req, res, next) => {
  const {title, content} = req.body;
  const newItem = {title, content};

  if (!newItem.title) {
    const err = new Error('Missing `title` in request body.');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem)
    .then( item => res.json(item) )
    .catch( err => next(err) );
});




notesRouter.delete('/notes/:id', (req, res, next) => {
  const targetId = req.params.id;

  notes.delete(targetId)
    .then( len => {
      if(len) {
        return res.sendStatus(204);
      } else {
        return next();
      }
    }).catch( err => next(err));
});

module.exports = notesRouter;