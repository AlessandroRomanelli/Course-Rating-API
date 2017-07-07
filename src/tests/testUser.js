'use strict';
var request = require('supertest');
var bcrypt = require('bcrypt');


describe('GET /users', () => {
  var server = require('../app');
  it("should return status 200 if authorization is valid", done => {
    request(server)
      .get('/api/users')
      .set('Authorization', 'Basic am9obkBzbWl0aC5jb206cGFzc3dvcmQ=')
      .expect(200, done);
  });

  it("should return JSON formatted data", done => {
    request(server)
      .get('/api/users')
      .set('Authorization', 'Basic am9obkBzbWl0aC5jb206cGFzc3dvcmQ=')
      .expect('Content-Type', /json/, done)
  });

  it("should return only one result", done => {
    request(server)
      .get('/api/users')
      .set('Authorization', 'Basic am9obkBzbWl0aC5jb206cGFzc3dvcmQ=')
      .end((err, res) => {
        if (err) throw err;
        if (Object.keys(res.body).length > 5) {
          var err = new Error('More than one user was returned');
          err.status = 500;
          throw err;
        }
        done();
      })
  });

  it("should only return the data of the authenticated user", done => {
    var token = "am9obkBzbWl0aC5jb206cGFzc3dvcmQ=",
    buffer = new Buffer(token, 'base64'),
    auth = buffer.toString(),
    auth = auth.split(':'),
    email = auth[0];
    request(server)
      .get('/api/users')
      .set('Authorization', `Basic ${token}`)
      .end((err, res) => {
        if (err) throw err;
        if (res.body.emailAddress != email) {
          var err = new Error('Returned user is different from the one authorized');
          err.status = 401;
          throw err;
        }
        done();
      });
  });

  it("should return error 401 if user doesn't provide any authorization data", done => {
    request(server)
      .get('/api/users')
      .expect(401, done);
  });

  it("should return error 401 if user provides invalid authorization data", done => {
    request(server)
      .get('/api/users')
      .set('Authorization', 'Basic notthekindoftokenyouwouldexpect')
      .expect(401, done);
  });
});
