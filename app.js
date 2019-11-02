const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

var cookieParser = require('cookie-parser');
// var session = require('express-session');
// const http = require('http');
//we are rendering the register/login page again if credentials are wrong 
//if user is registered we need to redirect to the login page, so we can't use 
//partials to display msg such as 'you are registered, continue to sign-in'
//so we need flash messages for that 



const app = express();
// const server = http.createServer(app);
const http = require('http').createServer(app);
const io = require('socket.io')(http);


// io.on('connection', (socket)=> console.log('a user connected...'))

io.on('connection', (socket) =>{
  console.log(`a user connected ${socket.id}`);
  socket.on('joined', function(data){
    io.sockets.emit('joined', data)
  })
  
  socket.on('chat', function(data){
    io.sockets.emit('chat', data);
  });

  socket.on('typing', function(data){
    socket.broadcast.emit('typing', data)
  });
  
  // socket.on('disconnect', (data) =>{
  // //   socket.on('left', function(data){
  // //   socket.broadcast.emit('left', data)
  // // })
  //   socket.broadcast.emit('left', data );
  // })
});


//passport config
require('./config/passport')(passport);

var url = process.env.MongoURI
//DB configuration
// const db = require('./config/keys').url;
const db = url;

//connect to mongo
mongoose.connect(db, {useNewUrlParser : true , useUnifiedTopology : true})
  .then(() => console.log('mongo db connected..'))
  .catch(err => console.log(err))

// Ejs middleware 
app.use(expressLayouts);
app.set('view engine', 'ejs');

//body parser middleware (for form inputs)
app.use(express.urlencoded({extended : false}));
const uuid = require('uuid');

//express session middleware 
app.use(session({
  secret: `${uuid.v4()}`,
  resave: true,
  saveUninitialized: true,
  genid: function(req) {
    return uuid.v4(); // use UUIDs for session IDs
  },
}));



app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

//Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

//middleware to connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

//routes
app.use('/', require('./routes/index.js'))
app.use('/users', require('./routes/users.js'))

const PORT = process.env.PORT || 5000;
// app.listen(PORT, ()=> console.log(`Server started at port ${PORT}`));
// server.listen(PORT, () => console.log(`Server started at port ${PORT}`))
http.listen(PORT, () => console.log(`Server started at port ${PORT}`));