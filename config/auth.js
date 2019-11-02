//Custom middleware to ensure any route is protected('/dashboard')-see index.js
module.exports = {
  ensureAuthenticated : function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error_msg', 'Please Login to continue..')
    res.redirect('/users/login')
  }
}

//'isAuthenticated' method is provided by passport 