const logger = require ('./util/logger');
const express = require ('express');
require ('dotenv').config ();
const bodyParser = require ('body-parser');
const mongoose = require ('mongoose');
const cors = require ('cors');
const session = require ('express-session');
const passport = require ('./util/passport');

const app = express ();
const PORT = process.env.PORT || 8080;

// importing all the routes
const authRoutes = require ('./routes/auth');
const productRoutes = require ('./routes/products');
const expensesRoutes = require ('./routes/expenses');

// Initialize body-parser to parse JSON request bodies
app.use (bodyParser.json ());
//session middleware to store passport data
app.use (
  session ({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use (passport.initialize ());
app.use (passport.session ());

//Initialize the routes
app.use ('/auth', authRoutes);
app.use ('/product', productRoutes);
app.use ('/expenses', expensesRoutes);

// Initialize the connection to mongoose and start the server
mongoose
  .connect (process.env.MONGO_URI)
  .then (() => {
    app.listen (PORT, () => {
      return logger.info (`Server running in port ${PORT}`);
    });
  })
  .catch (error => {
    return logger.error (`Error in connecting mongo db: ${error}`);
  });
