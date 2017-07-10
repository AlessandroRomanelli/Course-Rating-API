'use strict';

const express = require("express");
const router  = express.Router();
const User    = require('../models.js').User;
const Course  = require('../models.js').Course;
const Review  = require('../models.js').Review;
const bcrypt  = require('bcrypt');

// GET /users
router.get('/users', function(req, res, next) {
  User.authenticate(req.headers.authorization, (err, user) => {
    if (err) {
      return next(err)
    };
    res.statusCode = 200;
    res.json(user);
  });
});

// POST /users
router.post('/users', (req, res, next) => {
  let user = new User(req.body);
  let error = user.validateSync();
  if (error) {
    error.status = 400;
    return next(error);
  }
  if (req.body.password === req.body.confirmPassword) {
    User.create(user, (err, user) => {
      if (err) {
        err.status = 400;
        return next(err);
      } else {
        res.set('Location', '/');
        res.statusCode = 201;
        res.send();
      }
    });
  } else {
    var err = new Error;
    err.message = "The two password fields don't match!";
    err.status = 400;
    return next(err);
  };
});

//GET /courses
router.get('/courses', (req, res, next) => {
  Course.find({},{_id: true, title: true})
  .exec((err, courses) => {
    if (err) {return next(err)};
    res.json(courses);
    res.statusCode = 200;
  })
});

//GET /courses/:courseID
router.get('/courses/:courseId', (req, res, next) => {
  Course.findById(req.params.courseId).populate('reviews').populate({path: 'user', select: 'fullName'})
  .exec((err, course) => {
    if (err) {
      err.status = 404;
      err.message = `Unable to find course with the following ID: ${req.params.courseId}`;
      return next(err)
    };
    res.json(course);
    res.statusCode = 200;
  });
});

//POST /courses
router.post('/courses', (req, res, next) => {
  User.authenticate(req.headers.authorization, (err, user) => {
    if (err) {return next(err)};
    let course = new Course(req.body);
    Course.create(course, (err, course) => {
      if (err) {
        err.status = 400;
        return next(err)
      };
      res.set('Location', '/');
      res.statusCode = 201;
      res.send();
    });
  });
});

//PUT /coursed/:courseId
router.put('/courses/:courseId', (req, res, next) => {
  User.authenticate(req.headers.authorization, (err, user) => {
    if (err) {return next(err)};
    Course.findById(req.params.courseId)
    .exec((err, course) => {
      if (err || !course) {
        var err = new Error();
        err.message = "Couldn't find any courses matching this ID: " + req.params.courseId;
        err.status = 404;
        return next(err);
      };
      course.update(req.body, (err, result) => {
        if (err) {
          err.status = 400;
          return next(err);
        }
        res.statusCode = 204;
        res.send();
      });
    });
  });
});

//POST /courses/:courseId/reviews
router.post('/courses/:courseId/reviews', (req, res, next) => {
  User.authenticate(req.headers.authorization, (err, user) => {
    if (err) {return next(err)};
    let review = new Review(req.body);
    Review.create(review)
    .then((review) => {
      req.reviewId = review.id;
      return Course.findById(req.params.courseId).populate('user')
    })
    .then((course) => {
      if (user.id === course.user.id) {
        let err = new Error();
        err.message = "You are not allowed to review your own course.";
        err.status = 401;
        return next(err);
      }
      course.reviews.push(req.reviewId);
      course.save((err, result) => {
        if (err) {return next(err)};
        res.statusCode = 201;
        res.send();
      });
    })
    .catch((err) => {
      err.status = 400;
      next(err);
    });
  });
});

module.exports = router;
