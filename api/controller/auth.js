const Auth = require ('../model/auth');
const Profile = require ('../model/profile');
const bcrypt = require ('bcryptjs');
const passport = require ('passport');
const {
  isEmpty,
  isValidUsername,
  isValidEmail,
  isValidPassword,
} = require ('../util/validations');
const logger = require ('../util/logger');

/**
 * Handles user signup process
 * 1. Hashes the password using bcryptjs
 * 2. Stores auth data in mongodb using mongoose
 * 3. Creates one user profile in mongodb using mongoose
 * @param {Object} req 
 * @param {Object} req.body - {username:string, email:string, password:string}
 * @param {Object} res 
 * @param {Object} next 
 * @returns {Promise<void>}
 */
exports.signup = async (req, res, next) => {
  const {username, email, password} = req.body;
  let errors = [];
  if (isEmpty (username) || !isValidUsername (username)) {
    logger.error ('Invalid username');
    errors.push ('Enter a valid username');
  }
  if (isEmpty (email) || !isValidEmail (email)) {
    logger.error ('Invalid email');
    errors.push ('Enter a valid email');
  }
  if (isEmpty (password) || !isValidPassword (password)) {
    logger.error ('Invalid password');
    errors.push ('Enter a valid Password');
  }
  if (errors.length > 0)
    return res
      .status (422)
      .json ({message: 'Validation failed', errors: errors});
  try {
    // Checks if user already exists
    const userExists = await Auth.findOne ({email: email});
    if (userExists) {
      logger.error (`User already exists with email id: ${email}`);
      return res
        .status (409)
        .json ({message: 'User already exists with given email address'});
    }

    // hashed the password with salt value 12
    const hashedPassword = await bcrypt.hash (password, 12);

    const newUser = new Auth ({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save ();
    const userProfile = new Profile ({userId: newUser._id});
    await userProfile.save ();
    logger.info (
      `The user has been created successfully with id: ${newUser._id} and profile id: ${userProfile._id}`
    );
    res.status (201).json ({message: 'User created successfully'});
  } catch (error) {
    logger.error (`Internal error while signing up: ${error.stack}`);
    res.status (500).json ({message: 'Internal server error has been occured'});
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed' });
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        logger.info(`Error while logging in:${loginErr}`)
        return res.status(500).json({ message: 'Login failed' });
      }
      logger.info(`User logged in with user ID: ${user.id}`);
      return res.status(200).json({ message: 'User logged in successfully', userId:user._id });
    });
  })(req, res, next);
};

