if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const initializePassport = require('./passport-config');
const router = require('./routes');
const cors = require("cors");

const steamKey = process.env.API_KEY;

initializePassport(passport, steamKey);
var app = express();

// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

/** Saves the user */
app.use(cors({
  origin: "http://localhost:3010",
  credentials: true,
  // allowedHeaders: "*",
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // preflightContinue: true
}))
app.use(session({
    secret: process.env.SECRET,
    name: 'gamehelper',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 10,
    }
  }));

/** Allows for reading the session cookie set in serialization. Alters every request so the req.user member is set to 
 * the user found by the id deserialized of the session cookie
 * https://stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do
 */
app.use(passport.session());
app.use('/', router)

app.listen(3000);