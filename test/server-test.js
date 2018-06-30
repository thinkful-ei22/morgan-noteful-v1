'use strict';
//must install in command line first
//should show up in node_modules directory
const chai = require('chai');
const chaiHTTP = require('chai-http');
const app = require('../server.js');

const expect = chai.expect;

chai.use(chaiHTTP);


describe('Reality check', function(){
  it('true should be true', function(){
    expect(true).to.be.true;
  });

  it('2+2 should equal 4', function(){
    expect(2+2).to.equal(4);
  });
});


describe('Express static', function(){
    
  it('should return the index page when sending GET request to root endpoint', function(){
    return chai.request(app)
      .get('/')
      .then( function(response){
        expect(response).to.exist;
        expect(response).to.be.html;
        expect(response).to.have.status(200);
      });
  });
});


describe('404 handler', function(){
  it('should respond with 404 when given a bad path', function(){
    return chai.request(app)
      .get('/bad-path')
      .then( function(res){
        expect(res).to.have.status(404);
      });
  });
});


describe('GET requests to /api/notes', function(){
  it('should return an array of note-objects when GET request to /api/notes', function(){
    return chai.request(app)
      .get('/api/notes')
      .then(function(res){
        expect(res.body.length).to.equal(10);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        res.body.forEach(item => {
          expect(item).to.have.keys(['id', 'title', 'content']);
        });
      });
  });

  it(`should return an array of note-objects containing a searchTerm in the 
      title when query is attached to request`, function(){
    return chai.request(app)
      .get('/api/notes')
      .query({'searchTerm':'gaga'})
      .then( function(response) {
        response.body.forEach( obj => {
          expect(obj.title).to.include('gaga');
          expect(obj).to.have.keys(['id', 'title','content']);
        });
      });
  });

  it('should return an empty array if query is incorrect', function(){
    return chai.request(app)
      .get('/api/notes')
      .query({'searchTerm':'NO TITLE HAS THIS EXACT TITLe'})
      .then( function(response) {
        expect(response.body.length).to.equal(0);
      });
  });

});

describe('GET requests with Id', function(){
  it('should return single object if given correct id as GET parameter', function(){
    let testId;
    return chai.request(app)
      .get('/api/notes')
      .then( res => {
        testId = res.body[0].id;
      })
      .then(function(){
        return chai.request(app)
          .get(`/api/notes/${testId}`)
          .then( res => {
            expect(res).to.be.json;
            expect(res.body).to.include.keys(['id', 'title', 'content']);
            expect(res.body.id).to.equal(testId);
          });
      });
  });

  it('should return a 404 if ID is not valid with GET request', function(){
    return chai.request(app)
      .get('/api/notes/fakeID')
      .then( function(res) {
        expect(res).to.have.status(404);
      });
  });
});


describe('POST new note', function(){
  it('should create a new note with POST request containing request body', function(){
    return chai.request(app)
      .post('/api/notes')
      .send({title:'New Note', content:'New Content'})
      .then( function(res){
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys(['id', 'title', 'content']);
        expect(res.body).to.deep.equal(
          Object.assign({title:'New Note', content:'New Content'}, {id: res.body.id})
        );
        expect(res).to.have.header('location');
      });
  });

  it('should return 404 if no title in POST req.body', function(){
    const newNote = {title:'', content:'Some Content'};
    return chai.request(app)
      .post('/api/notes')
      .send(newNote)
      .then( function(res) {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Missing `title` in request body.');
      });
  });
});

describe('PUT handler', function(){
  it('should update a note with valid req.title in PUT request', function(){
    let fakeId;
  
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        fakeId = res.body[0].id;
      })
      .then( () =>{
        return chai.request(app)
          .put(`/api/notes/${fakeId}`)
          .send({title:'New Title', content:'New Content'})
          .then( response => {
            expect(response).to.be.a('object');
            expect(response.body.title).to.equal('New Title');
            expect(response.body.content).to.equal('New Content');
            expect(response.body.id).to.equal(fakeId);
          });
      });
  });


  it('should return 404 if invalid id is provided', function(){
    return chai.request(app)
      .put('/api/notes/NOT-AN-ID')
      .send({title:'New Title', content:'New Content'})
      .then(response => {
        expect(response).to.have.status(404);
      });  
  });


  it('should return a message if invalide title is provided', function(){
    let fakeId;
  
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        fakeId = res.body[0].id;
      }).then( () => {
        return chai.request(app)
          .put('/api/notes/' + fakeId)
          .send({title:'', content:'New Content'})
          .then( function(res){
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal('Missing `title` in request body.');
            expect(res).to.have.status(400);
          });
      });
  });

});

describe('DELETE queries', function(){
  it('should delete a Note if provided a valid Id', function(){
    let fakeId;
    let priorLength;
  
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        fakeId = res.body[0].id;
        priorLength = res.body.length;
      }).then( () => {
        return chai.request(app)
          .delete('/api/notes/' + fakeId)
          .then( response => {
            expect(response).to.have.status(204);
          }).then( () => {
            return chai.request(app)
              .get('/api/notes')
              .then( res => {
                expect(res.body.length).to.equal(priorLength - 1);
              });
          });
      });
  });

  it('should return 404 if incorrect Id on DELETE request', function(){
    return chai.request(app)
      .delete('/api/notes/NOT-AN-ID')
      .then(res => expect(res).to.have.status(404));
  });
});
