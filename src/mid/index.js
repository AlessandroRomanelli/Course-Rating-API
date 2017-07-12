const User    = require('../models.js').User;
const bcrypt  = require('bcrypt');


function authRequired (req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' '),
    buffer = new Buffer(token[1], 'base64'),
    creds = buffer.toString(),
    creds = creds.split(/:/),
    email = creds[0],
    password = creds[1];
    User.findOne({emailAddress: email})
    .exec(function(err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        var err = new Error();
        err.message = 'There are no e-mails matching your credentials.';
        err.status = 401;
        return next(err);
      } else {
        bcrypt.compare(password, user.password, function(err, result) {
          if (result) {
            res.locals.authUser = user;
            return next();
          } else {
            var err = new Error();
            err.message = "The password you submitted doesn't match our records. Try again.";
            err.status = 401;
            return next(err);
          }
        });
      }
    })
  } else {
    var err = new Error();
    err.message = "You didn't provide an authorization to access this data.";
    err.status = 401;
    return next(err);
  };
};

module.exports.authRequired = authRequired;
