const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const GoogleStrategy = require ('passport-google-oauth20').Strategy;
const Auth = require ('../model/auth');
const bcrypt = require ('bcryptjs');
const logger = require ('./logger');

// passport local authentication
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

passport.use (
  new GoogleStrategy (
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Auth.findOne ({googleId: profile.id});
        let existingUser = await Auth.findOne ({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          logger.error ('The email address already exists');
          return done (null, false, {
            message: 'User already exists with this email. Please log in instead.',
          });
        }

        if (!user) {
          user = new Auth ({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            profilePicture: profile.photos[0].value,
          });
          await user.save ();
        }
        return done (null, user);
      } catch (error) {
        logger.error (`Error while signing up using google auth: ${error}`);
        return done (error, null);
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
