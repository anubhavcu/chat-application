const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//load user model
const User = require('../models/Users');

//local strategy invokes the verify callback with credentials as arguments(credentials contained in request which passport parses). By default these credentials are 'username' and 'password' but here we are comparing with email so we can set the 'usernameField' as 'email'. //see documentation -http://www.passportjs.org/docs/authenticate/

module.exports = function(passport){
  passport.use(
    new LocalStrategy({usernameField : 'email'}, (email, password, done) => {
      //match user
      User.findOne({email : email})
        .then(user => {
          if(!user){ 
          return done(null, false, {message : 'The email is not registered'});
          }

          //if user exists - match password ('user' is coming from database)
          bcrypt.compare(password, user.password, (err, isMatch) =>{
            if(err){
              throw err
            }
            if(isMatch){
              return done(null, user)
            }
            else{
              return done(null, false, {message : 'Password is incorrect'})
            }
          });
        })
        .catch(err => console.log(err))
    })
  )
  //used to serialize the user for the session -read at the bottom
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  // used to deserialize the user for the session
  passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

}



// In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
// also -https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize