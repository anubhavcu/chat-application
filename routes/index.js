const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const path = require('path');
const emoji = require('node-emoji');



//welcome page
router.get('/', (req, res) => res.render('welcome'))


//dashboard 
router.get('/dashboard', ensureAuthenticated, (req,res) => {
  if (req.session.page_views >= 1){
  req.logOut();
  req.flash('error_msg', 'Please Login again to continue..');
  res.redirect('/users/login');
  }else{
  req.session.page_views += 1;
  res.render('dashboard', {
  name : req.user.name,
  // email : req.user.email,
  // link : '/users/edit'
  link: `/users/edit/${req.user.email}`
})
}
});

// router.get('/dashboard', ensureAuthenticated , (req, res) => {
//   // res.sendFile(__dirname + '/public/index.html')
//   res.sendFile(path.parse(__dirname).dir + '/public/index.html', {name: req.user.name})
// })
module.exports = router; 



//working for page reload
// // if (sessionStorage.getItem("is_reloaded")){
// //   req.logOut();
// //   req.flash('error_msg', 'Please log in again to continue..');
// //   res.redirect('/users/login');
// // }
// // sessionStorage.setItem("is_reloaded" , true)