const logger = require ('./util/logger');
const express = require ('express');
require ('dotenv').config ();
const bodyParser = require ('body-parser');
const mongoose = require ('mongoose');
const cors = require ('cors');
const session = require ('express-session');
const passport = require ('./util/passport');
// redis connection
const Redis = require ('redis');
const {RedisStore} = require ('connect-redis');

const RedisClient = Redis.createClient ({
  username: 'default',
  password: 'WJW0qykBGNjhnjlDoSLRsk6PdsVWdS8l',
  socket: {
    host: 'redis-13548.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 13548,
  },
});
RedisClient.connect ().catch (err =>
  logger.error (`Error while connecting redis:${err}`)
);

let redisStore = new RedisStore ({client: RedisClient, prefix: 'store:'});

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
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
  })
);
app.use (passport.initialize ());
app.use (passport.session ());

app.use (async (req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  }
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
