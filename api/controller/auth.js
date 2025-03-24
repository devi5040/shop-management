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
 * @param {Function} next 
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

/**
 * Handles the logging in through passport js local strategy
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @return {Promise<void>}
 */
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

/**
 * Initiates Google OAuth authentication process.
 * Redirects the user to Google's login page where they can authenticate.
 * The callback URL will handle the response after authentication.
 */
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

/**
 * Handles the Google OAuth callback after user authentication.
 * - Uses Passport.js to authenticate the user with Google.
 * - If authentication fails, returns an appropriate error response.
 * - If successful, logs the user in and returns a success response with user ID.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
exports.googleCallback= (req,res,next)=>{
  passport.authenticate("google",(error, user, info)=>{
    if(error){
      logger.error(`Error in google callback function:${error}`)
      return res.status(500).json({message:"Internal server error"})
    }
    if(!user){
      logger.error('User authentication failed')
      return res.status(401).json({message:info?.message||'Authentication failed'})
    }
    req.logIn(user,loginErr=>{
      if(loginErr){
        logger.error(`User login failed: ${loginErr}`)
        return res.status(500).json({message:'User login failed'})
      }
      logger.info(`User logged in successfully. google id:${user.googleId} and userId:${user._id}`)
      return res.status(200).json({message:"User logged in successfully",userId:user._id})
    })
  })(req,res,next);
}

/**
 * Initiates Facebook authentication process.
 * Redirects the user to Facebook's login page where they can authenticate.
 * The callback URL will handle the response after authentication.
 */
exports.facebookLogin = passport.authenticate('facebook',{scope:['email']});

/**
 * Handles facebook callback after user authentication
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.facebookCallback = async(req,res,next)=>{
  passport.authenticate('facebook',(error, user, info)=>{
    if(error){
      logger.info(`Some internal error while handling facebook callback: ${error}`)
      return res.status(500).json({message:'Internal server error'})
    }
    if(!user){
      logger.error('User authentication failed');
      return res.status(401).json({message:info?.message||'Authentication failed'})
    }

    req.logIn(user, (loginErr)=>{
      if(loginErr){
        logger.error(`Error while logging in using facebook: ${loginErr}`);
        return res.status(500).json({message:'Logging in failed'})
      }
      logger.info(`User logged in successfully. facebookId:${user.facebookId} userId:${user._id}`)
      return res.status(200).json({message:'User logged in successfully',userid:user._id})
    })
  })
}

/**
 * Handles the user logout
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.logout = (req,res,next) =>{
  req.logout(err=>{
    if(err){
      logger.error(`Error while logging out user: ${err}`);
      return res.status(500).json({message:'Error while logging out'})
    }
    req.session.destroy(destroyErr=>{
      if(destroyErr){
        logger.error(`Session destruction failed: ${destroyErr}`)
        return res.status(500).json({message:'Internal error while logging out'})
      }
      res.clearCookie("connect.sid");
      logger.error('User logged out successfully')
      res.status(200).json({message:"User logged out successfully"})
    })
  })
}