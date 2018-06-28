'use strict';

const express = require('express');

const data = require('../db/notes');
const simDB = require('../db/simDB');

const notesRouter = express.Router();
const notes = simDB.initialize(data);


notesRouter.get('/notes', (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err);
    }
    res.json(list);
  });
});





notesRouter.get('/notes/:id', (req, res, next) => {
  const targetId = req.params.id;
  notes.find(targetId, (err, item) => {
    console.log('err is: ' + err);
    console.log('item is: ' + item);
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




notesRouter.put('/notes/:id', (req, res, next) => {
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




notesRouter.post('/notes', (req, res, next) => {
  const {title, content} = req.body;
  const newItem = {title, content};

  if (!newItem.title) {
    const err = new Error('Missing `title` in request body.');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});




notesRouter.delete('/notes/:id', (req, res, next) => {
  const targetId = req.params.id;

  notes.delete(targetId, (err, result) => {
    if (err) {
      return next(err);
    }
    if (result) {
      res.sendStatus(204);
    } else {
      next();
    }
 
  });
});

module.exports = notesRouter;