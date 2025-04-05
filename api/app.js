const logger = require ('./util/logger');
const express = require ('express');
require ('dotenv').config ();
const bodyParser = require ('body-parser');
const mongoose = require ('mongoose');
const cors = require ('cors');
const session = require ('express-session');
const passport = require ('./util/passport');
const User = require ('./model/auth');

const app = express ();
const PORT = process.env.PORT || 8080;

// importing all the routes
const authRoutes = require ('./routes/auth');
const productRoutes = require ('./routes/products');
const expensesRoutes = require ('./routes/expenses');
const cartRoutes = require ('./routes/cart');
const orderRoutes = require ('./routes/orders');

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

app.use (async (req, res, next) => {
  const user = await User.findById ('67ed4783773af80c554f0128');
  req.user = user;
  next ();
});

//Initialize the routes
app.use ('/auth', authRoutes);
app.use ('/product', productRoutes);
app.use ('/expenses', expensesRoutes);
app.use ('/cart', cartRoutes);
app.use ('/order', orderRoutes);

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
