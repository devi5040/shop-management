const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const Auth = require ('../model/auth');
const bcrypt = require ('bcryptjs');
const logger = require ('./logger');

passport.use (
  new LocalStrategy (
    {usernameField: 'email'},
    async (email, password, done) => {
      try {
        const user = await Auth.findOne ({email});
        if (!user) {
          logger.error ('User does not exists');
          return done (null, false, {message: 'User does not exists'});
        }
        const isMatch = await bcrypt.compare (password, user.password);
        if (!isMatch) {
          logger.error ('Password is not correct');
          return done (null, false, {message: 'Incorrect Password'});
        }
        logger.info ('User logged in successfully');
        return done (null, user);
      } catch (error) {
        logger.error (`Error while logging in:${error}`);
        return done (error);
      }
    }
  )
);

// serialize the user (store user id in session)
passport.serializeUser ((user, done) => {
  done (null, user.id);
});

// deserialize the user (fetch the user id from db)
passport.deserializeUser (async (id, done) => {
  try {
    const user = await Auth.findById (id);
    done (null, user);
  } catch (error) {
    logger.error (`Error while deserializing user ${error}`);
    done (error);
  }
});

module.exports = passport;
