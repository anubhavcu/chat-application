const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const path = require('path');
//require models
const User = require('../models/Users')
 


//settings page
router.get('/edit/:email',ensureAuthenticated , (req, res) => {
  if(req.session.page_views >=4){
  req.logOut();
  req.flash('error_msg', 'Too many requests detected.Please Login again to continue..');
  res.redirect('/users/login');
  }else{
    req.session.page_views += 1;    
    // res.send(req.params)
    res.render('edit');
  }

})

// // edit form put request
// router.put('/edit/:email', (req, res) => {
//   req.flash('success_msg', 'Information updated successfully ... ')
// })


//delete page
router.get('/delete', (req, res) => {
    res.sendFile(path.join(path.parse(__dirname).dir, 'public', '404.html'))
  // res.render('delete')
})


//Login page 
router.get('/login', (req, res) => res.render('login'))

//Register
router.get('/register' , (req,res) => res.render('register'))

//Register handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if(!name || !email || !password || !password2){
    errors.push({msg : 'Please fill in all fields ...'})
  } 
  //check if passwords match
  if(password !== password2){
    errors.push({msg : 'Passwords do not match..'})
  }

  //check password is atleast six characters
  if(password.length < 6) {
    errors.push({msg : 'Password should be atleast 6 characters ... '})
  }

  if(errors.length > 0) {
    res.render('register' , {
      errors,
      name, 
      email,
      password,
      password2
    })
  }else{
    //check if user already exists or not 
    User.findOne({ email : email})
      .then(user => {
        if(user) {
          //user exists
          errors.push({msg : 'Email is already registered ..!'})
          res.render('register' , {
            errors,      // same as email : email
            name, 
            email,
            password,
            password2
          })
        }
        else{
          const newUser = new User({
            name,
            email,
            password
          });
          // console.log(newUser);
          // res.send('hello')

          //hash password with bcrypt
          bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(newUser.password, salt , (err, hash) => {
              if(err) throw err
              //set password to generated hash
              newUser.password = hash;
              //save user 
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered ...')
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))

          }))
        }
      })
  }
})


//login handle
router.post('/login', (req, res, next) => {
  req.session.page_views = 0;
  passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/users/login',
    failureFlash : true
  })(req,res,next)
});


//logout handle 
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'You are Logged out..');
  res.redirect('/users/login');
})



module.exports = router;