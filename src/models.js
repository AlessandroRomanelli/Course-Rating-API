'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'User full name is required'],
    trim: true
  },
  emailAddress: {
    type: String,
    required: [true, 'User e-mail address is required'],
    validate: {
      validator: function(v) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
      },
      message: 'The email you provided is invalid'
    },
    trim: true
  },
  password: {
    type: String,
    required: [true, 'User must provide a password']
  }
});

UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if(err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

var ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  postedOn: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: [1, "The rating score you're submitting is too low, needs to be greater than 1."],
    max: [5, "The rating score you're submitting is too high, needs to be smaller than 5."]
  },
  review: String
});

var StepSchema = new Schema({
    stepNumber: Number,
    title: {type: String, required: [true, 'Title is required']},
    description: {type: String, required: [true, 'A short description is required']}
});

var CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'A title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'A brief description is required']
  },
  estimatedTime: String,
  materialsNeeded: String,
  steps: {type: [StepSchema]},
  reviews: [{type: [Schema.Types.ObjectId], ref: 'Review'}]
});

CourseSchema.method("update", function(updates, callback) {
  Object.assign(this, updates);
  this.save(callback);
});

var User = mongoose.model('User', UserSchema);
var Review = mongoose.model('Review', ReviewSchema);
var Course = mongoose.model('Course', CourseSchema);

module.exports.Course = Course;
module.exports.Review = Review;
module.exports.User = User;
